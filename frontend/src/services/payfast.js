import md5 from "md5";

class PayFastService {
  constructor() {
    // PayFast sandbox credentials
    this.merchant_id = '10000100';
    this.merchant_key = '46f0cd694581a';
    this.passphrase = ''; // No passphrase for basic test
    
    // URLs
    this.payfastUrl = 'https://sandbox.payfast.co.za/eng/process';
    this.return_url = `http://localhost:5173/payment/success`;
    this.cancel_url = `http://localhost:5173/payment/cancel`;
    this.notify_url = `http://localhost:5050/api/payment/notify`;
  }

  // Generate MD5 signature exactly as PayFast expects
  generateSignature(data) {
    // Create a clean copy without signature field
    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (key !== 'signature' && data[key] !== '') {
        cleanData[key] = data[key];
      }
    });
    
    // Sort parameters alphabetically (CRITICAL for PayFast)
    const sortedKeys = Object.keys(cleanData).sort();
    
    // Create parameter string
    let pfOutput = "";
    for (let key of sortedKeys) {
      // URL encode the value and replace + with %20
      const encodedValue = encodeURIComponent(cleanData[key].toString().trim()).replace(/%20/g, '+');
      pfOutput += `${key}=${encodedValue}&`;
    }
    
    // Remove last '&'
    pfOutput = pfOutput.substring(0, pfOutput.length - 1);
    
    // Add passphrase if exists
    if (this.passphrase) {
      pfOutput += `&passphrase=${encodeURIComponent(this.passphrase).replace(/%20/g, '+')}`;
    }
    
    console.log('Signature string:', pfOutput);
    const signature = md5(pfOutput);
    console.log('Generated signature:', signature);
    return signature;
  }

  createPaymentData(orderDetails) {
    // Ensure amount is properly formatted with 2 decimal places
    const amount = Number(orderDetails.amount).toFixed(2);
    
    // Create data object with ONLY the fields PayFast needs
    // Order is not important here as we'll sort later
    const data = {
      // Required fields
      merchant_id: this.merchant_id,
      merchant_key: this.merchant_key,
      return_url: this.return_url,
      cancel_url: this.cancel_url,
      notify_url: this.notify_url,
      amount: amount,
      item_name: (orderDetails.item_name || 'LumberLink Order').substring(0, 100),
      
      // Optional but recommended
      name_first: (orderDetails.name_first || '').substring(0, 50),
      name_last: (orderDetails.name_last || '').substring(0, 50),
      email_address: (orderDetails.email_address || '').substring(0, 100),
      
      // Email confirmation
      email_confirmation: '1',
    };

    // Add confirmation address if email exists
    if (orderDetails.email_address) {
      data.confirmation_address = orderDetails.email_address;
    }

    // Add optional fields only if they exist
    if (orderDetails.cell_number) {
      data.cell_number = orderDetails.cell_number.substring(0, 50);
    }
    
    if (orderDetails.item_description) {
      data.item_description = orderDetails.item_description.substring(0, 255);
    }

    // Remove any empty fields
    Object.keys(data).forEach(key => {
      if (data[key] === '') delete data[key];
    });

    // Generate signature
    data.signature = this.generateSignature(data);
    
    console.log('Final PayFast data:', data);
    return data;
  }

  redirectToPayFast(orderDetails) {
    try {
      const paymentData = this.createPaymentData(orderDetails);
      
      // Create form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = this.payfastUrl;
      form.target = '_self';

      // Add fields in alphabetical order (helps with debugging)
      const sortedKeys = Object.keys(paymentData).sort();
      for (let key of sortedKeys) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      console.log('Submitting form to PayFast with data:', paymentData);
      form.submit();
    } catch (error) {
      console.error('PayFast redirect error:', error);
      throw error;
    }
  }
}

export default new PayFastService();