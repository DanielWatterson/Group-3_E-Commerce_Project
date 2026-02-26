import axios from "axios";

class PayFastService {
  constructor() {
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
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  redirectToPayFast(session) {
    if (!session?.payfast_redirect_url) {
      throw new Error("PayFast hosted URL is missing from backend response");
    }

    window.location.assign(session.payfast_redirect_url);
  }
}

export default new PayFastService();
