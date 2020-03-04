"use strict";

const CheckRuc = require('check-ruc');

const reCAPTCHA = require('./reCAPTCHA');
const { LoginSOLError } = require('./errors');

class LoginSOL {
  /**
   * @constructor
   * @param {Puppeteer} page, página de sunat
   */
  constructor(page = null) {
    this.ruc = null;
    this.username = null;
    this.password = null;
    this.strategy = null;
    this.page = page;

    return (async () => {
      this.recaptcha = await reCAPTCHA.get(this.page);

      return this;
    }).call(this);
  }

  // Methods
    setStrategy(strategy) {
      this.strategy = strategy;
    }

    /**
     * Logearse al portal SOL (sunat operaciones en linea)
     * @param {String} RUC, número de ruc
     * @param {String} username, usuario sol
     * @param {String} password, clave sol
     */
    async signin(ruc=null, username=null, password=null) {
      this.ruc = ruc;
      this.username = username;
      this.password = password;

      if (!CheckRuc.isOk(this.ruc)) {
        throw new LoginSOLError(`El número de RUC ingresado es incorrecto: ${this.ruc}`, {
          reprocess: false 
        });
      }

      try {
        await this.page.waitForFunction(() => {
          return document.readyState === 'complete';
        }, { polling: 200, timeout: 20 * 1000 });
      } catch ({ message }) {
        throw new Error(`El formulario de inicio de sesión no ha cargado: ${message}`);
      }

      // Seleccionar el tipo de ingreso al portal SOL
      try {
        const loginTypeBtn = await this.page.waitForSelector('button#btnPorRuc', { 
          timeout: 10 * 1000, 
          visible: true 
        });

        await loginTypeBtn.click();
      } catch ({message}) {
        throw new Error(`El ingreso con RUC a SOL no está disponible: ${message}`);
      }

      await this._setCredentials();

      await this._setRecaptchaToken();

      // Inicio de sesión
      try {
        const loginBtn = await this.page.waitForSelector('button#btnAceptar', {
          timeout: 10 * 1000, 
          visible: true 
        });

        await loginBtn.click();
      } catch ({message}) {
        throw new Error(`El botón para iniciar sesión no está disponible: ${message}`);
      }

      // Tras realizar el login, y en caso de éxito o error (algunos específicos),
      // seremos redirigidos a otra página, donde podremos ver 
      // la plataforma (caso éxito) o mensajes informativos (caso error).

      // Ante un redireccionamiento, tendremos que esperar a que los
      // nuevos componenetes de la página sean reflejados en el dom.

      try {
        // Empleamos este mecanismo debido a que "waitForNavigation",
        // siempre espera que haya un redireccionamiento, y en caso
        // de no haberlo, lanzará una excepción por "timeout".

        // Este método evalua el "readyState" de la página 
        // ante un redireccionamiento, y en caso de no haberlo, 
        // se entiende que "readyState" no sufre modificación (será el mismo)
        await this.page.waitForFunction(() => {
          return document.readyState === 'complete';
        }, { polling: 200, timeout: 40 * 1000 });
      } catch ({ message }) {
        throw new Error(`Demora en la carga de la página: ${message}`);
      }
      
      // Tras realizar el inicio de sesión, evaluamos las url
      // para determinar donde hacer la búsqueda de errores de logeo.
      // Los errores pueden estar en la página redirigida o 
      // en la misma página de inicio de sesión
      if (this.page.url().indexOf('/AutenticaMenuInternet.htm') !== -1) {
        try {
          await this.page.waitForSelector('div.alert.alert-danger.text-left', {
            visible: true,
            timeout: 10 * 1000
          });
  
          const warningMessage = await this._getContent('div.alert.alert-danger.text-left');
          
          const screenshot = await this._getCapture('div.panel.panel-primary');
          
          if (warningMessage.indexOf('Captcha') !== -1) {
            throw new LoginSOLError(warningMessage, { 
              screenshot, 
              reprocess: true 
            });
          } else {
            throw new LoginSOLError(warningMessage, { 
              screenshot, 
              reprocess: false 
            });
          }          
        } catch (error) {
          throw error;
        }
      } else if (this.page.url().indexOf('/MenuInternet.htm') !== -1 && this.page.url().indexOf('?pestana=') === -1) {
        try {
          await this.page.waitForSelector('span#spanMensajeError', {
            visible: true,
            timeout: 10 * 1000
          });

          const warningMessage = await this._getContent('span#spanMensajeError');
          
          const screenshot = await this._getCapture('div.panel.panel-primary');
          
          throw new LoginSOLError(warningMessage, {
            screenshot, reprocess: false
          }); 
        } catch (error) {
          throw error;
        }
      }
    }

    async _getContent(selector) {
      const text = await this.page.evaluate(function(selector) {
        return document.querySelector(selector).innerText;
      }, selector);

      return text ? text.trim() : '';
    }

    async _getCapture(selector) {
      const html = await this.page.$(selector);

      const screenshot = await html.screenshot({ encoding: 'base64' });

      return screenshot;
    }

    /**
     * Ingresar las credenciales SOL al formulario de logeo
     */
    async _setCredentials() {
      const options = {
        timeout: 5000,
        visible: true,
      };

      const selectors = {
        txtIdentity: 'input#txtRuc',
        txtUsername: 'input#txtUsuario',
        txtPassword: 'input#txtContrasena',
      };

      try {
        const identityTxt = await this.page.waitForSelector(selectors.txtIdentity, options);

        const usernameTxt = await this.page.waitForSelector(selectors.txtUsername, options);

        const passwordTxt = await this.page.waitForSelector(selectors.txtPassword, options);

        await identityTxt.type(this.ruc);

        await usernameTxt.type(this.username);

        await passwordTxt.type(this.password);
      } catch ({message}) {
        throw new Error(`Los controles de autenticación no están disponibles: ${message}`);
      }
    }

    /**
     * Obtener e ingresar el token obtenido del servicio 2captcha para desviar el recaptcha
     */
    async _setRecaptchaToken() {
      let gRecaptchaResponse;
      
      // validamos si existe alguna estrategia
      // que resuelva el recaptcha de google
      if (!this.strategy) {
        // hemos experimentando ingresando manualmente cualquier valor
        // al elemento "g-recaptcha-response" de recaptcha, haciendo 
        // que la validación sea totalmente satisfactoria
        gRecaptchaResponse = 'wtf';
      } else {
        await this.strategy.resolve(this.recaptcha.siteKey, this.recaptcha.pageUrl);
        
        gRecaptchaResponse = this.strategy.token;
      }

      await this.page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${gRecaptchaResponse}";`);
    }
}

exports = module.exports = LoginSOL;

exports.strategies = require('./strategies');
