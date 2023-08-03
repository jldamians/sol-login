"use strict";

const axios = require('axios');
const poller = require('promise-poller').default;
const { CANCEL_TOKEN } = require('promise-poller');

const HttpClient = require('./HttpClient');

class TwoCaptcha {
  constructor(apiKey) {
    this.name = '2captcha';
    this.apiKey = apiKey;

    this.recaptcha = null;
    this.token = null;
    this.ticket = null;
  }

  async resolve(recaptcha) {
    this.recaptcha = recaptcha;

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

      return this.token;
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
    googlekey: this.recaptcha.siteKey,
    key: this.apiKey,
    pageUrl: this.recaptcha.pageUrl,
    json: 1, // default 0
    invisible: 0, // default 0
  };

  return await HttpClient.get('https://2captcha.com/in.php', 'ticket', params);
}

async function _getToken() {
  const params = {
    key: this.apiKey,
    action: 'get',
    id: this.ticket,
    json: 1, // default 0
  }

  return await HttpClient.get('https://2captcha.com/res.php', 'exchange', params);
}

module.exports = (apiKey) => {
  const service = new TwoCaptcha(apiKey);

  return async (recaptcha) => {
    await service.resolve(recaptcha);
  };
};
