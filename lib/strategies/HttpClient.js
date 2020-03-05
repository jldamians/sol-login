const axios = require('axios');

class HttpClient {
  static async get(url, action, params) {
    const { data } = await axios.get(url, { params });

    if (data.status === 0) {
      throw new Error(`[${url}][${action}] Servicio 2captcha: ${data.request}`);
    }

    return data.request;
  }
}

module.exports = HttpClient;