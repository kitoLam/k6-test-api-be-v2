import http from 'k6/http';

export class ApiClient {
  baseUr;
  token;

  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  // Định nghĩa payload dựa trên ClientCreateInvoiceSchema của bạn
  createInvoice(payload) {
    const params = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };
    return http.post(`${this.baseUrl}/api/v1/invoices`, JSON.stringify(payload), params);
  }
}