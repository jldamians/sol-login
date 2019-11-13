"use strict";

const axios = require('axios');
const poller = require('promise-poller').default;

const { LoginSOLError } = require('./errors');

class LoginSOL {
  /**
   * @constructor
   * @param {Puppeteer} page, página de sunat
   */
  constructor(page=null) {
    this._page = page;

    this._RUC = null;
    this._username = null;
    this._password = null;

    this._recaptcha = null;
    this._bypassing = null;
  }

  // Getters
    get RUC() {
      return this._RUC;
    }
    get username() {
      return this._username;
    }
    get password() {
      return this._password;
    }
    get recaptcha() {
      return this._recaptcha;
    }
    get bypassing() {
      return this._bypassing;
    }

  // Methods
    /**
     * Configurar el api key de la cuenta en 2captcha
     * @param {String} key, api key de 32 caracteres
     */
    setKey(key=null, type='2captcha') {
      if (!key || String(key).length < 32) {
        throw new Error(`El api key ingresado es incorrecto: ${key}`);
      }

      this._bypassing = { key, type };
    }

    /**
     * Logearse al portal SOL (sunat operaciones en linea)
     * @param {String} RUC, número de ruc
     * @param {String} username, usuario sol
     * @param {String} password, clave sol
     */
    async signin(RUC=null, username=null, password=null) {
      this._RUC = RUC;
      this._username = username;
      this._password = password;

      await this._page.waitForFunction(() => {
        return document.readyState === 'complete';
      }, { polling: 200, timeout: 20 * 1000 });

      try {
        const loginTypeBtn = await this._page.waitForSelector('button#btnPorRuc', { timeout: 10 * 1000, visible: true });

        await loginTypeBtn.click();
      } catch ({message}) {
        throw new Error(`La autenticar con RUC no está disponible: ${message}`);
      }

      await this._setCredentials();

      await this._setRecaptchaToken();

      try {
        const loginBtn = await this._page.waitForSelector('button#btnAceptar', { timeout: 10 * 1000, visible: true });

        await loginBtn.click();
      } catch ({message}) {
        throw new Error(`El botón para iniciar sesión no está disponible: ${message}`);
      }

      // Esperamos a que el cambio de página haya sido reflejado en el dom
      try {
        await this._page.waitForNavigation({
          waitUntil: 'domcontentloaded', timeout: 40 * 1000
        });
      } catch ({message}) {
        throw new Error(`Demora en la carga de la página: ${message}`);
      }

      // Evaluamos el cambio de URL para determinar si el logeo ha sio incorrecto
      if (this._page.url().indexOf('/AutenticaMenuInternet.htm') !== -1) {
        const HTMLElement = await this._page.$('div.panel.panel-primary');

        const screenshot = await HTMLElement.screenshot({ encodign: 'base64' });

        throw new LoginSOLError(
          'Los datos de autenticación son incorrectos', { screenshot, reprocess: false }
        );
      }
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
        const identityTxt = await this._page.waitForSelector(selectors.txtIdentity, options);

        const usernameTxt = await this._page.waitForSelector(selectors.txtUsername, options);

        const passwordTxt = await this._page.waitForSelector(selectors.txtPassword, options);

        await identityTxt.type(this._RUC);

        await usernameTxt.type(this._username);

        await passwordTxt.type(this._password);
      } catch ({message}) {
        throw new Error(`Los controles de autenticación no están disponibles: ${message}`);
      }
    }

    /**
     * Obtener e ingresar el token obtenido del servicio 2captcha para desviar el recaptcha
     */
    async _setRecaptchaToken() {
      if (!(!!this._bypassing && !!this._bypassing.key)) {
        throw new Error('Debe configurar el api key del servicio 2captcha');
      }

      this._recaptcha = await this._getRecaptcha();

      /**
       * Realizar una solicitud de captcha a 2captcha
       * @param {String} sitekey, google key del recaptcha de google
       * @param {String} apikey, api key del servicio 2captcha
       */
      const getCaptchaID = async (sitekey=null, apikey=this._bypassing.key) => {
        const params = {
          method: 'userrecaptcha',
          googlekey: sitekey,
          key: apikey,
          pageUrl: this._page.url(),
          json: 1,
        }

        const { data } = await axios.get('https://2captcha.com/in.php', { params });

        if (data.status === 0) {
          throw new Error(`El servicio 2captcha no ha podido entregar el ID: ${data.request}`);
        }

        return data.request;
      }

      /**
       * Obtener el token solicitado a 2captcha
       * @param {String} request, identificador de la solicitud de token
       * @param {String} apikey, api key del servicio 2captcha
       */
      const getToken = async (request=null, apikey=this._bypassing.key) => {
        const task = async () => {
          const params = {
            key: apikey,
            action: 'get',
            id: request,
            json: 1
          }

          const { data } = await axios.get('https://2captcha.com/res.php', { params });

          if (data.status === 0) {
            throw new Error(`El servicio 2captcha aún no tiene listo el token: ${data.request}`);
          }

          return data.request;
        }

        return poller({
          taskFn: task,
          interval: 1500,
          retries: 30,
        });
      }

      this._bypassing.id = await getCaptchaID(this._recaptcha.sitekey);

      this._bypassing.token = await getToken(this._bypassing.id);

      await this._page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${this._bypassing.token}";`);
    }

    /**
     * Obtener información del recaptcha
     */
    async _getRecaptcha() {
      // Nos aseguramos que la página tenga reCAPTCHA de google
      try {
        await this._page.waitForFunction(() => {
          return window.___grecaptcha_cfg && window.___grecaptcha_cfg.count && window.___grecaptcha_cfg.clients;
        }, { polling: 200, timeout: 20 * 1000 });
      } catch ({message}) {
        throw new Error(`No se ha encontrado recaptcha en la página: ${message}`);
      }

      const recaptcha = await this._page.evaluate(() => {
        const selector = 'iframe[src^="https://www.google.com/recaptcha/api2/anchor"][name^="a-"]';

        const $iframes = Array.from(document.querySelectorAll(selector));

        return $iframes
          .filter(($iframe) => {
            const attribute = $iframe.getAttribute('src') && $iframe.getAttribute('name');

            if (!attribute) {
              return false;
            }

            return !$iframe.src.includes('invisible');
          }).map(($iframe) => {
            let id, sitekey;

            $iframe.style.filter = `opacity(60%) hue-rotate(400deg)`; // violet

            id = $iframe.getAttribute('name').split('-').slice(-1).shift();

            const hashes = $iframe.src.slice($iframe.src.indexOf('?') + 1).split('&');

            hashes.forEach((hash) => {
              const [key, val] = hash.split('=');

              if (key === 'k') {
                sitekey = decodeURIComponent(val);
              }
            });

            return { id, sitekey };
          }).shift();
      });

      return recaptcha;
    }
}

module.exports = LoginSOL;
