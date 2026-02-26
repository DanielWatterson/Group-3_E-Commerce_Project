// paymentController.js
import {
  getAllPayments as getAllPaymentsModel,
  getPaymentById as getPaymentByIdModel,
  getPaymentsByOrderId as getPaymentsByOrderIdModel,
  createPayment as createPaymentModel,
  updatePaymentStatus as updatePaymentStatusModel,
  deletePayment as deletePaymentModel,
  getOrderTotal as getOrderTotalModel,
} from "../models/paymentModel.js";

import {
  getOrderById as getOrderByIdModel,
  createOrder as createOrderModel,
  updateOrder as updateOrderModel,
} from "../models/orderModel.js";

import { addOrderItem as addOrderItemModel } from "../models/orderItemModel.js";
import { getProductById as getProductByIdModel } from "../models/productModel.js";
import {
  getCustomerByEmail as getCustomerByEmailModel,
  postCustomer as postCustomerModel,
  getCustomerById as getCustomerByIdModel,
} from "../models/customerModel.js";

import { hashPassword } from "../middleware/auth.js";
import payfastService from "../services/payfastService.js";

const createValidationError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const PAYFAST_ITN_DEBUG_LIMIT = 20;
const payfastItnDebugEntries = [];
const logPayfastItn = (message, payload) => {
  if (payload === undefined) {
    console.log(`[PayFast ITN] ${message}`);
    return;
  }
  console.log(`[PayFast ITN] ${message}`, payload);
};

const addPayfastItnDebugEntry = (entry) => {
  payfastItnDebugEntries.unshift(entry);
  if (payfastItnDebugEntries.length > PAYFAST_ITN_DEBUG_LIMIT) {
    payfastItnDebugEntries.length = PAYFAST_ITN_DEBUG_LIMIT;
  }
  console.log("PayFast ITN DEBUG:", JSON.stringify(entry, null, 2));
};

const buildPayfastItnDebugEntry = (req, rawBody, itnData, source) => ({
  received_at: new Date().toISOString(),
  source,
  method: req.method,
  path: req.originalUrl,
  ip: req.ip,
  content_type: req.get("content-type") || "",
  user_agent: req.get("user-agent") || "",
  headers: req.headers,
  raw_body: rawBody,
  parsed_body: itnData,
});

const resolveCustomer = async (customer) => {
  const email = String(customer?.email || "").trim().toLowerCase();
  const firstName = String(customer?.firstName || "").trim();
  const lastName = String(customer?.lastName || "").trim();

  if (!email) {
    throw createValidationError("Customer email is required");
  }

  const existing = await getCustomerByEmailModel(email);
  if (existing) {
    return existing;
  }

  const customerName = `${firstName} ${lastName}`.trim() || email;
  const generatedPassword = `payfast_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const hashedPassword = await hashPassword(generatedPassword);

  try {
    const created = await postCustomerModel(customerName, email, hashedPassword);
    return await getCustomerByIdModel(created.insertId);
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      const duplicate = await getCustomerByEmailModel(email);
      if (duplicate) {
        return duplicate;
      }
    }
    if (error?.message === "Email already registered") {
      throw createValidationError("Email already registered", 409);
    }
    throw error;
  }
};

const createOrderWithItems = async (customerId, items) => {
  const order = await createOrderModel(customerId, "pending");
  const orderId = order.insertId;
  const validatedItems = [];

  for (const item of items) {
    const product = await getProductByIdModel(item.product_id);

    if (!product) {
      throw createValidationError(`Product ${item.product_id} not found`);
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createValidationError(`Invalid quantity for product ${item.product_id}`);
    }

    if (quantity > Number(product.quantity || 0)) {
      throw createValidationError(`Insufficient stock for ${product.product_name}`);
    }

    await addOrderItemModel(orderId, item.product_id, quantity);

    validatedItems.push({
      product_name: product.product_name,
      quantity,
    });
  }

  return { orderId, validatedItems };
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await getAllPaymentsModel();
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentByIdModel(id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPaymentsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await getOrderByIdModel(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const payments = await getPaymentsByOrderIdModel(orderId);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching order payments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { order_id, payment_method, payment_status } = req.body;

    if (!order_id || !payment_method) {
      return res.status(400).json({ error: "Order ID and payment method are required" });
    }

    const order = await getOrderByIdModel(order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const calculatedAmount = await getOrderTotalModel(order_id);
    if (!calculatedAmount || Number(calculatedAmount) <= 0) {
      return res.status(400).json({ error: "Order has no items or invalid total" });
    }

    const payment = await createPaymentModel(
      order_id,
      calculatedAmount,
      payment_method,
      payment_status || "pending",
    );

    const newPayment = await getPaymentByIdModel(payment.insertId);

    res.status(201).json({
      message: "Payment created successfully",
      amount: calculatedAmount,
      payment: newPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPayfastPayment = async (req, res) => {
  try {
    if (!payfastService.hasValidConfig()) {
      return res.status(500).json({
        error: "PayFast configuration is missing",
      });
    }

    const { customer = {}, item_name } = req.body;
    const items = payfastService.normalizeCartItems(req.body?.items);

    if (!customer?.email) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    if (!items.length) {
      return res.status(400).json({ error: "At least one cart item is required" });
    }

    const resolvedCustomer = await resolveCustomer(customer);
    const { orderId, validatedItems } = await createOrderWithItems(resolvedCustomer.customer_id, items);

    const calculatedAmount = await getOrderTotalModel(orderId);
    if (!calculatedAmount || Number(calculatedAmount) <= 0) {
      return res.status(400).json({ error: "Unable to calculate valid order total" });
    }

    const payment = await createPaymentModel(orderId, calculatedAmount, "payfast", "pending");
    const paymentId = payment.insertId;

    const paymentData = payfastService.buildPaymentData({
      paymentId,
      orderId,
      amount: calculatedAmount,
      customer,
      itemName:
        item_name ||
        (validatedItems.length === 1
          ? validatedItems[0].product_name
          : `LumberLink Order (${validatedItems.length} items)`),
      itemDescription: payfastService.buildItemDescription(validatedItems),
    });

    const payfastRedirectUrl = await payfastService.createHostedPaymentUrl(paymentData);
    if (!payfastRedirectUrl) {
      throw new Error("PayFast hosted URL was not generated");
    }

    res.status(201).json({
      message: "PayFast session created",
      payment_id: paymentId,
      order_id: orderId,
      payfast_redirect_url: payfastRedirectUrl,
    });
  } catch (error) {
    console.error("Error creating PayFast payment:", error);
    res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
  }
};

export const handlePayfastNotify = async (req, res) => {
  try {
    const startedAt = Date.now();
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body || "");
    const itnData = payfastService.parseRawItnBody(rawBody);
    logPayfastItn("Incoming notify request", {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      contentType: req.get("content-type") || "",
      userAgent: req.get("user-agent") || "",
      headers: req.headers,
      rawBody,
      itnData,
    });

    if (!rawBody || !itnData.signature) {
      logPayfastItn("Rejected: invalid payload (empty body or missing signature)");
      return res.status(400).send("Invalid ITN payload");
    }

    const paymentId = Number(itnData.m_payment_id);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      logPayfastItn("Rejected: invalid payment reference", { m_payment_id: itnData.m_payment_id });
      return res.status(400).send("Invalid payment reference");
    }

    const payment = await getPaymentByIdModel(paymentId);
    if (!payment) {
      logPayfastItn("Rejected: payment not found", { paymentId });
      return res.status(404).send("Payment not found");
    }

    if (!payfastService.validateMerchantDetails(itnData)) {
      logPayfastItn("Rejected: merchant mismatch", {
        expectedMerchantId: process.env.PAYFAST_MERCHANT_ID,
        receivedMerchantId: itnData.merchant_id,
      });
      return res.status(400).send("Invalid merchant details");
    }

    if (!payfastService.validateItnSignature(itnData)) {
      logPayfastItn("Rejected: invalid signature", {
        paymentId,
        receivedSignature: itnData.signature,
      });
      return res.status(400).send("Invalid signature");
    }

    if (!payfastService.validateAmount(itnData, payment.amount)) {
      logPayfastItn("Rejected: amount mismatch", {
        paymentId,
        expectedAmount: payment.amount,
        receivedAmount: itnData.amount_gross,
      });
      return res.status(400).send("Amount mismatch");
    }

    const isValidByPayfast = await payfastService
      .validateWithPayfastServer(rawBody)
      .catch((error) => {
        console.error("PayFast server validation error:", error);
        return false;
      });

    if (!isValidByPayfast) {
      logPayfastItn("Rejected: PayFast server-side validation failed", { paymentId });
      return res.status(400).send("Server validation failed");
    }

    const { paymentStatus, orderStatus } = payfastService.mapPayfastStatus(itnData.payment_status);
    logPayfastItn("Validation passed; mapping status", {
      paymentId,
      payfastStatus: itnData.payment_status,
      mappedPaymentStatus: paymentStatus,
      mappedOrderStatus: orderStatus,
    });

    if (payment.payment_status !== paymentStatus) {
      await updatePaymentStatusModel(paymentId, paymentStatus);
      logPayfastItn("Payment status updated", {
        paymentId,
        previousPaymentStatus: payment.payment_status,
        nextPaymentStatus: paymentStatus,
      });
    }

    const orderId = Number(itnData.custom_str1 || payment.order_id);
    if (Number.isInteger(orderId) && orderId > 0) {
      const order = await getOrderByIdModel(orderId);
      if (order && order.order_status !== orderStatus) {
        await updateOrderModel(orderId, order.customer_id, orderStatus);
        logPayfastItn("Order status updated", {
          orderId,
          previousOrderStatus: order.order_status,
          nextOrderStatus: orderStatus,
        });
      }
    }

    logPayfastItn("Handled successfully", {
      paymentId,
      durationMs: Date.now() - startedAt,
    });
    return res.status(200).send("OK");
  } catch (error) {
    console.error("[PayFast ITN] Processing error:", error);
    return res.status(500).send("Server Error");
  }
};

export const handlePayfastNotifyDebug = async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body || "");
    const itnData = payfastService.parseRawItnBody(rawBody);

    addPayfastItnDebugEntry(buildPayfastItnDebugEntry(req, rawBody, itnData, "notify-debug"));

    return res.status(200).type("text/plain").send("OK");
  } catch (error) {
    console.error("PayFast ITN debug endpoint error:", error);
    return res.status(500).type("text/plain").send("Server Error");
  }
};

export const getPayfastNotifyDebugLog = async (req, res) => {
  return res.status(200).json({
    count: payfastItnDebugEntries.length,
    items: payfastItnDebugEntries,
  });
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status) {
      return res.status(400).json({ error: "Payment status is required" });
    }

    const existingPayment = await getPaymentByIdModel(id);
    if (!existingPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    await updatePaymentStatusModel(id, payment_status);
    const updatedPayment = await getPaymentByIdModel(id);

    res.json({
      message: "Payment status updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPayment = await getPaymentByIdModel(id);
    if (!existingPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    await deletePaymentModel(id);

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
