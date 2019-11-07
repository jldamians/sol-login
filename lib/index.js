"use strict";

const axios = require('axios');

const poller = require('promise-poller').default;

class LoginSOL {
  /**
   * @constructor
   * @param {Puppeteer} page, página de sunat
   */
  constructor(page=null, { key }={}) {
    this._page = page;
    this._identity = null;
    this._username = null;
    this._password = null;
    this._recaptcha = null;
    this._request = {};

    // api key de 32 caracteres
    this._key = key;
  }

  // Getters
    get identity() {
      return this._identity;
    }
    get username() {
      return this._username;
    }
    get password() {
      return this._password;
    }

  // Methods
    /**
     * Logearse al portal SOL (sunat operaciones en linea)
     * @param {String} identity, número de ruc
     * @param {String} username, usuario sol
     * @param {String} password, clave sol
     */
    async signin(identity=null, username=null, password=null) {
      this._identity = identity;
      this._username = username;
      this._password = password;

      await this._page.waitForFunction(() => {
        return document.readyState === 'complete';
      }, { polling: 200, timeout: 20 * 1000 });

      try {
        const loginTypeBtn = await this._page.waitForSelector('button#btnPorRuc', { timeout: 5000, visible: true });

        await loginTypeBtn.click();
      } catch (error) {
        throw new Error('La opción para autenticar con RUC no está disponible');
      }

      await this._setCredentials();

      await this._setRecaptchaToken();

      try {
        const loginBtn = await this._page.waitForSelector('button#btnAceptar', { timeout: 5000, visible: true });

        await loginBtn.click();

        console.log(`[factiva-login][${new Date().getTime()}] Iniciando sesión en el portal SOL`);
      } catch (error) {
        throw new Error('La opción para iniciar sesión no está disponible');
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

        await identityTxt.type(this._identity);

        await usernameTxt.type(this._username);

        await passwordTxt.type(this._password);

        console.log(`[factiva-login][${new Date().getTime()}] Ingresando información de autenticación`);
      } catch (error) {
        throw new Error(`Los controles de autenticación no están disponibles: ${error}`)
      }
    }

    /**
     * Obtener e ingresar el token obtenido del servicio 2captcha para desviar el recaptcha
     */
    async _setRecaptchaToken() {
      if (this._key === null) {
        throw new Error('No se ha encontrado el api key del servicio 2captcha');
      }

      this._recaptcha = await this._getRecaptcha();

      /**
       * Realizar una solicitud de captcha a 2captcha
       * @param {String} sitekey, google key del recaptcha de google
       * @param {String} apikey, api key del servicio 2captcha
       */
      const getCaptchaID = async (sitekey=null, apikey=this._key) => {
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

        console.log(`[factiva-login][${new Date().getTime()}] Realizando solicitud de captcha a 2captcha: ${data.request}`);

        return data.request;
      }

      /**
       * Obtener el token solicitado a 2captcha
       * @param {String} request, identificador de la solicitud de token
       * @param {String} apikey, api key del servicio 2captcha
       */
      const getToken = async (request=null, apikey=this._key) => {
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

          console.log(`[factiva-login][${new Date().getTime()}] Obteniendo token solicitado a 2captcha: ${data.request}`);

          return data.request;
        }

        return poller({
          taskFn: task,
          interval: 1500,
          retries: 30,
        });
      }

      this._request.id = await getCaptchaID(this._recaptcha.sitekey);

      this._request.token = await getToken(this._request.id);

      await this._page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${this._request.token}";`);
    }

    /**
     * Obtener información del recaptcha
     */
    async _getRecaptcha() {
      await this._page.waitForFunction(() => {
        return window.___grecaptcha_cfg && window.___grecaptcha_cfg.count && window.___grecaptcha_cfg.clients;
      }, { polling: 200, timeout: 10 * 1000 });

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
            })

            return { id, sitekey };
          }).shift();
      });

      console.log(`[factiva-login][${new Date().getTime()}] Obteniendo información del recaptcha: ${recaptcha.sitekey}`);

      return recaptcha;
    }
}

module.exports = LoginSOL;
