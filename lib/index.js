"use strict";

const CheckRuc = require('check-ruc');

const WaitForPageLoad = require('./WaitForPageLoad');
const SelectLoginType = require('./SelectLoginType');
const SetWebsiteLoginCredentials = require('./SetWebsiteLoginCredentials');
const SetWebsiteRecaptchaToken = require('./SetWebsiteRecaptchaToken');
const LoginWebsiteSOL = require('./LoginWebsiteSOL');
const ExternalAuthenticationFailures = require('./ExternalAuthenticationFailures');
const InternalAuthenticationFailures = require('./InternalAuthenticationFailures');

const Taxpayer = require('./Domain/Taxpayer');
const reCAPTCHA = require('./reCAPTCHA');
const { LoginSOLError } = require('./errors');

class LoginSOL {
  /**
   * @constructor
   * @param {Puppeteer} page, página de sunat
   */
  constructor(page) {
    this.page = page;
    this.strategy = null;
    this.recaptcha = null;
    this.taxpayer = null;
  }

  // Methods
    setStrategy(strategy) {
      this.strategy = strategy;
    }

    /**
     * Logearse al portal SOL (sunat operaciones en linea)
     * @param {String} ruc, número de ruc
     * @param {String} username, usuario sol
     * @param {String} password, clave sol
     */
    async signin(ruc, username, password) {
      this.taxpayer = new Taxpayer(ruc, username, password);

      await WaitForPageLoad(this.page);
      await SelectLoginType(this.page);
      await this.setSOLCredentials(this.taxpayer);
      await this.setRecaptchaToken();
      await LoginWebsiteSOL(this.page);

      // Tras realizar el login, y en caso de éxito o error (algunos específicos),
      // seremos redirigidos a otra página, donde podremos ver
      // la plataforma (caso éxito) o mensajes informativos (caso error).
      await WaitForPageLoad(this.page);

      // Tras realizar el inicio de sesión, evaluamos las url
      // para determinar donde hacer la búsqueda de errores de logeo.
      // Los errores pueden estar en la página redirigida o
      // en la misma página de inicio de sesión
      if (InternalAuthenticationFailures.its(this.page.url()) === true) {
        await InternalAuthenticationFailures(this.page);
      } else if (ExternalAuthenticationFailures.its(this.page.url()) === true) {
        await ExternalAuthenticationFailures(this.page);
      }
    }

    /**
     * Ingresar las credenciales SOL al formulario de logeo
     */
    async setSOLCredentials(taxpayer) {
      await SetWebsiteLoginCredentials(this.page)(taxpayer);
    }

    /**
     * Obtener e ingresar el token obtenido del servicio 2captcha para desviar el recaptcha
     */
    async setRecaptchaToken() {
      let token = null;

      if (this.strategy) {
        this.recaptcha = await this.getRecaptchaInfoFromPage();
        token = await this.strategy(this.recaptcha);
      }

      await SetWebsiteRecaptchaToken(this.page)(token);
    }

    async getRecaptchaInfoFromPage() {
      const recaptcha = await reCAPTCHA.get(this.page);
      return recaptcha;
    }
}

exports = module.exports = (page) => {
  const login = new LoginSOL(page);

  return {
    setStrategy: (strategy) => {
      login.setStrategy(strategy);
    },
    signin: async (ruc, username, password) => {
      await login.signin(ruc, username, password);
    },
    get strategy() {
      return login.strategy;
    },
    get recaptcha() {
      return login.recaptcha
    },
    get taxpayer() {
      return login.taxpayer
    },
  }
};

exports.strategies = require('./strategies');
