const axios = require('axios');
const poller = require('promise-poller').default;
const { CANCEL_TOKEN } = require('promise-poller');

class Captcha {
  constructor(apiKey) {
    this.name = '2captcha';
    this.token = null;
    this.ticket = null;
    this.apiKey = apiKey;
    this.siteKey = null;
    this.pageUrl = null;
  }

  async resolve(siteKey, pageUrl) {
    this.siteKey = siteKey;
    this.pageUrl = pageUrl;
    
    const newGetToken = _getToken.bind(this);
    const newGetTicket = _getTicket.bind(this);

    this.ticket = await newGetTicket();

    const params = {
      taskFn: async () => {
        try {
          const token = await newGetToken();
           
          return token;
        } catch (error) {
          const { message } = error;

          if (message.search('CAPCHA_NOT_READY') !== -1) {
            throw error;
          } else {
            // cancelamos el proceso al recibir una respuesta diferente a "CAPCHA_NOT_READY"
            throw CANCEL_TOKEN;
          }
        }
      },
      // repetimos el proceso cada 2seg
      interval: 2 * 1000,
      // repetimos el proceso 15 veces
      retries: 15,
      // esperamos 3seg la respuesta del proceso
      //timeout: 3 * 1000,
      // esperamos 35seg para obtener el token
      masterTimeout: 35 * 1000,
      progressCallback: (retries, error) => {
        console.log(`[${retries}] ${error.message}`);
      }
    };

    try {
      this.token = await poller(params);      
    } catch (error) {
      if (typeof error === 'string') {
        throw new Error(error);
      } else if (Array.isArray(error) === true) {
        throw new Error('unknown');
      } else {
        throw error;
      }
    }
  }

  toReportBad() {
    const params = {
      key: this.apiKey,
      action: 'reportbad',
      id: ticket,
      json: 1, // default 0
    }
  }

  toReportGood() {
    const params = {
      key: this.apiKey,
      action: 'reportgood',
      id: ticket,
      json: 1, // default 0
    }
  }
}

async function _getTicket() {
  const params = {
    method: 'userrecaptcha',
    googlekey: this.siteKey,
    key: this.apiKey,
    pageUrl: this.pageUrl,
    json: 1, // default 0
    invisible: 0, // default 0
  };

  const { data } = await axios.get('https://2captcha.com/in.php', { params });

  if (data.status === 0) {
    throw new Error(`[https://2captcha.com/in.php][userrecaptcha] Servicio 2captcha: ${data.request}`);
  }

  // obtenemos el número de ticket
  return data.request;
}

async function _getToken() {
  const params = {
    key: this.apiKey,
    action: 'get',
    id: this.ticket,
    json: 1, // default 0
  }

  const { data } = await axios.get('https://2captcha.com/res.php', { params });

  if (data.status === 0) {
    // lanzamos excepción cuando el token (captcha) aún no está listo
    throw new Error(`[https://2captcha.com/res.php][get] Servicio 2captcha: ${data.request}`);
  }
  
  // obtenemos el token (captcha) producto del canje
  return data.request;
}

module.exports = Captcha;