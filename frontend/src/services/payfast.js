import axios from "axios";

class PayFastService {
  constructor() {
<<<<<<< HEAD
    this.merchant_id = '10046111';
    this.merchant_key = '46x04yxzlj934';
    this.passphrase = 'payfaster2026'; // MUST match sandbox exactly
    
    this.payfastUrl = 'https://sandbox.payfast.co.za/eng/process';
    this.return_url = 'http://localhost:5173/payment/success';
    this.cancel_url = 'http://localhost:5173/payment/cancel';
    this.notify_url = 'http://localhost:5173/payment/notify';
  }

  generateSignature(data) {
    // Remove signature field and empty values
    const cleanData = {};
    Object.keys(data)
      .filter(key => key !== 'signature' && data[key] !== '' && data[key] !== null)
      .sort()
      .forEach(key => {
        cleanData[key] = data[key].toString().trim();
      });
    
    // Build string
    let pfOutput = '';
    const keys = Object.keys(cleanData).sort();
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = encodeURIComponent(cleanData[key]).replace(/%20/g, '+');
      pfOutput += `${key}=${value}`;
      if (i < keys.length - 1) pfOutput += '&';
    }
    
    // Add passphrase
    pfOutput += `&passphrase=${encodeURIComponent(this.passphrase).replace(/%20/g, '+')}`;
    
    console.log('Signature string:', pfOutput);
    const signature = md5(pfOutput);
    console.log('Generated signature:', signature);
    
    return signature;
  }

  createPaymentData(order) {
    const amount = Number(order.amount).toFixed(2);
    
    // Include ALL fields that PayFast might need
    const data = {
      merchant_id: this.merchant_id,
      merchant_key: this.merchant_key,
      return_url: this.return_url,
      cancel_url: this.cancel_url,
      notify_url: this.notify_url,
      amount: amount,
      item_name: order.item_name.substring(0, 100),
      email_confirmation: '1',
      name_first: order.name_first || 'Test',
      name_last: order.name_last || 'User',
      email_address: order.email_address || 'test@example.com',
      confirmation_address: order.email_address || 'test@example.com',
    };

    // Remove empty fields
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });

    data.signature = this.generateSignature(data);
    return data;
  }

  redirectToPayFast(order) {
    const paymentData = this.createPaymentData(order);
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.payfastUrl;
    form.target = '_self';

    // Add fields in alphabetical order
    Object.keys(paymentData).sort().forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
=======
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
  }

  async createPaymentSession(checkoutData) {
    const { data } = await axios.post(`${this.apiBaseUrl}/payfast/create-payment`, checkoutData);
    return data;
  }

  submitToPayFast(payfastUrl, paymentData) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = payfastUrl;
    form.target = "_self";

    Object.keys(paymentData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
>>>>>>> 79c2dc5a5e7377ceb1c490899ae8008f1de2358b
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
<<<<<<< HEAD
    console.log('Submitting to PayFast:', paymentData);
    form.submit();
=======
    form.submit();
  }

  redirectToPayFast(session) {
    if (!session?.payfast_redirect_url) {
      throw new Error("PayFast hosted URL is missing from backend response");
    }

    window.location.assign(session.payfast_redirect_url);
>>>>>>> 79c2dc5a5e7377ceb1c490899ae8008f1de2358b
  }
}

export default new PayFastService();
