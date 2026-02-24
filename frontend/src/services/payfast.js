import md5 from "md5";

class PayFastService {
  constructor() {
    this.merchant_id = '10046111';
    this.merchant_key = '46x04yxzlj934';
    this.passphrase = 'payfastertoday';
    
    this.payfastUrl = 'https://sandbox.payfast.co.za/eng/process';
    this.return_url = 'http://localhost:5173/payment/success';
    this.cancel_url = 'http://localhost:5173/payment/cancel';
    this.notify_url = 'http://localhost:5050/api/payment/notify';
  }

  encodeValue(value) {
    return encodeURIComponent(value.toString().trim()).replace(/%20/g, '+');
  }

  generateSignature(data) {
    const cleanData = {};
    
    Object.keys(data)
      .filter(key => key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined)
      .sort()
      .forEach(key => {
        cleanData[key] = data[key].toString().trim();
      });
    
    let pfOutput = "";
    const keys = Object.keys(cleanData).sort();
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = this.encodeValue(cleanData[key]);
      pfOutput += `${key}=${value}`;
      if (i < keys.length - 1) pfOutput += '&';
    }
    
    if (this.passphrase) {
      pfOutput += `&passphrase=${this.encodeValue(this.passphrase)}`;
    }
    
    return md5(pfOutput);
  }

  createPaymentData(orderDetails) {
    const amount = Number(orderDetails.amount).toFixed(2);
    
    const data = {
      merchant_id: this.merchant_id,
      merchant_key: this.merchant_key,
      return_url: this.return_url,
      cancel_url: this.cancel_url,
      notify_url: this.notify_url,
      amount: amount,
      item_name: (orderDetails.item_name || 'LumberLink Order').substring(0, 100),
      email_confirmation: '1',
    };

    if (orderDetails.name_first) data.name_first = orderDetails.name_first.substring(0, 50);
    if (orderDetails.name_last) data.name_last = orderDetails.name_last.substring(0, 50);
    if (orderDetails.email_address) {
      data.email_address = orderDetails.email_address.substring(0, 100);
      data.confirmation_address = orderDetails.email_address;
    }
    if (orderDetails.cell_number) {
      data.cell_number = orderDetails.cell_number.replace(/\D/g, '').substring(0, 10);
    }
    if (orderDetails.item_description) {
      data.item_description = orderDetails.item_description.substring(0, 255);
    }

    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });

    data.signature = this.generateSignature(data);
    return data;
  }

  redirectToPayFast(orderDetails) {
    try {
      const paymentData = this.createPaymentData(orderDetails);
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = this.payfastUrl;
      form.target = '_self';

      Object.keys(paymentData).sort().forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('PayFast redirect error:', error);
      throw error;
    }
  }
}

export default new PayFastService();