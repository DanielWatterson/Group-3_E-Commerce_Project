import axios from "axios";
import crypto from "crypto";

const PAYFAST_SANDBOX_URL = "https://sandbox.payfast.co.za";
const PAYFAST_LIVE_URL = "https://www.payfast.co.za";

const toAmountString = (value) => Number(value || 0).toFixed(2);

const isEmptyValue = (value) => value === "" || value === null || value === undefined;

const formEncode = (value) =>
  encodeURIComponent(String(value ?? ""))
    .replace(/[!'()~]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");

const createSignature = (value) => crypto.createHash("md5").update(value).digest("hex");

const toFormBody = (data) =>
  Object.keys(data)
    .map((key) => `${key}=${formEncode(data[key])}`)
    .join("&");

const getEnvironment = () =>
  process.env.PAYFAST_MODE === "live" ? "production" : "sandbox";

const getPassphrase = () => {
  const value = String(process.env.PAYFAST_PASSPHRASE || "").trim();
  return value || null;
};

const getMerchantId = () => String(process.env.PAYFAST_MERCHANT_ID || "").trim();

const getMerchantKey = () => String(process.env.PAYFAST_MERCHANT_KEY || "").trim();

const getBaseUrl = () =>
  getEnvironment() === "production" ? PAYFAST_LIVE_URL : PAYFAST_SANDBOX_URL;

const parsePayfastHtmlError = (html) => {
  const text = String(html || "");
  const match = text.match(/<span class="err-msg">([\s\S]*?)<\/span>/i);
  if (!match?.[1]) {
    return null;
  }
  return match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
};

const buildItnValidationString = (itnData) => {
  const pairs = [];

  Object.keys(itnData).forEach((key) => {
    // PayFast ITN signatures include empty parameters as key=
    if (key === "signature") {
      return;
    }
    pairs.push(`${key}=${formEncode(itnData[key])}`);
  });

  const passphrase = getPassphrase();
  if (passphrase) {
    pairs.push(`passphrase=${formEncode(passphrase)}`);
  }

  return pairs.join("&");
};

const normalizeCartItems = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          product_id: Number(item?.product_id),
          quantity: Number(item?.quantity ?? item?.cart_quantity ?? 0),
        }))
        .filter((item) => Number.isInteger(item.product_id) && item.product_id > 0 && item.quantity > 0)
    : [];

const buildItemDescription = (items) =>
  items
    .map((item) => `${item.product_name} x${item.quantity}`)
    .join(", ")
    .slice(0, 255);

const buildPaymentData = ({ paymentId, orderId, amount, customer, itemName, itemDescription }) => {
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL ;
  const backendBaseUrl = process.env.BACKEND_BASE_URL ;

  const paymentInput = {
    return_url: `${frontendBaseUrl}/payment/success?payment_id=${paymentId}&order_id=${orderId}`,
    cancel_url: `${frontendBaseUrl}/payment/cancel?payment_id=${paymentId}&order_id=${orderId}`,
    notify_url: `${backendBaseUrl}/payfast/notify`,
    name_first: String(customer?.firstName || "").slice(0, 50),
    name_last: String(customer?.lastName || "").slice(0, 50),
    email_address: String(customer?.email || "").slice(0, 100),
    m_payment_id: String(paymentId),
    amount: toAmountString(amount),
    item_name: String(itemName || `LumberLink Order #${orderId}`).slice(0, 100),
    item_description: String(itemDescription || "").slice(0, 255),
    custom_str1: String(orderId),
  };

  const cleanedInput = {};
  Object.keys(paymentInput).forEach((key) => {
    if (!isEmptyValue(paymentInput[key])) {
      cleanedInput[key] = String(paymentInput[key]).trim();
    }
  });

  const signatureSource = {
    merchant_id: getMerchantId(),
    merchant_key: getMerchantKey(),
    ...cleanedInput,
  };

  const signatureString = toFormBody({
    ...signatureSource,
    ...(getPassphrase() ? { passphrase: getPassphrase() } : {}),
  });
  const signature = createSignature(signatureString);

  return {
    ...signatureSource,
    signature,
  };
};



const createHostedPaymentUrl = async (paymentData) => {
  const endpoint = `${getBaseUrl()}/eng/process`;
  const body = toFormBody(paymentData);

  const response = await axios.post(endpoint, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    validateStatus: () => true,
    maxRedirects: 0,
  });

  const location = response.headers?.location;
  if (response.status >= 300 && response.status < 400 && location) {
    if (location.startsWith("http://") || location.startsWith("https://")) {
      return location;
    }
    return `${getBaseUrl()}${location}`;
  }

  

  if (response.status >= 400) {
    const reason = parsePayfastHtmlError(response.data);
    const suffix = reason ? `: ${reason}` : "";
    throw new Error(`PayFast hosted URL generation failed (${response.status})${suffix}`);
  }

  return null;
};

const parseRawItnBody = (rawBody) => {
  const params = new URLSearchParams(rawBody || "");
  const data = {};

  for (const [key, value] of params.entries()) {
    data[key] = value;
  }

  return data;
};

const validateMerchantDetails = (itnData) =>
  String(itnData.merchant_id || "") === String(process.env.PAYFAST_MERCHANT_ID || "");

const validateAmount = (itnData, expectedAmount) =>
  toAmountString(itnData.amount_gross) === toAmountString(expectedAmount);

const validateItnSignature = (itnData) => {
  const validationString = buildItnValidationString(itnData);
  const signature = createSignature(validationString);
  return signature === itnData.signature;
};

const validateWithPayfastServer = async (rawBody) => {
  const endpoint = `${getBaseUrl()}/eng/query/validate`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: rawBody,
  });

  const responseText = (await response.text()).trim();
  return responseText === "VALID";
};

const mapPayfastStatus = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "COMPLETE") {
    return { paymentStatus: "completed", orderStatus: "paid" };
  }

  if (normalized === "FAILED" || normalized === "CANCELLED") {
    return { paymentStatus: "failed", orderStatus: "cancelled" };
  }

  return { paymentStatus: "pending", orderStatus: "pending" };
};

const hasValidConfig = () =>
  Boolean(getMerchantId() && getMerchantKey());

export default {
  normalizeCartItems,
  buildItemDescription,
  buildPaymentData,
  parseRawItnBody,
  validateMerchantDetails,
  validateAmount,
  validateItnSignature,
  validateWithPayfastServer,
  mapPayfastStatus,
  hasValidConfig,
  createHostedPaymentUrl,
  getProcessUrl: () => `${getBaseUrl()}/eng/process`,
};
