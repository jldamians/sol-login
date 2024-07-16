"use strict";

import { Page } from "puppeteer";

import { UnexpectedError } from "../errors/UnexpectedError.js";
import { WebpageLoadingError } from "../errors/WebpageLoadingError.js";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.js";
import { HTMLElementNotFoundError } from "../errors/HTMLElementNotFoundError.js";

import WaitForPageLoadStateSupport from "./supports/WaitForPageLoadStateSupport.js";
import GetElementContentTextSupport from "./supports/GetElementContentTextSupport.js";

export class CheckLoginFormErrorMessages {
  /**
   * @constructor
   * @param {Page} page Página
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Instanciar con página
   * @param {Page} page Página
   * @returns {CheckLoginFormErrorMessages}
   */
  static onPage(page) {
    return new this(page);
  }

  async check() {
    /**
     * Tras realizar el inicio de sesión.
     *
     * En caso de éxito: Se redireccionará al portal SOL de la SUNAT
     *
     * En caso de error: Puede que sea redireccionado a una página en
     * donde se muestra la falla en la autenticación, o puede que los
     * errores de validación sean mostrados en el mismo formulario
     * de inicio de sesión
     */

    /**
     * Tras realizar el inicio de sesión.
     *
     * SI hay redireccionamiento: Esperamos
     * a que la página cargue con o sin sus recursos.
     *
     * NO hay redireccionamiento: No tendremos
     * que esperar la carga de la página puesto que está cargada
     */
    await this._waitForPageLoad();

    // cuando no hay error detectado por el api de seguridad
    // se registrará la siguiente URL de redirección:
    // 302 - https://api-seguridad.sunat.gob.pe/v1/clientessol/4f3b88b3-d9d6-402a-b85d-6a0bc857746a/oauth2/j_security_check

    if (this._isOnLoginPage()) {
      await this._checkLoginForm();
    } else if (this._isOnErrorPage()) {
      // cuando hay un error detectado por el api de seguridad,
      // se registrarán las siguientes URL's de redirección:
      // 302 - https://api-seguridad.sunat.gob.pe/v1/clientessol/4f3b88b3-d9d6-402a-b85d-6a0bc857746a/oauth2/j_security_check
      // 200 - https://api-seguridad.sunat.gob.pe/v1/clientessol/4f3b88b3-d9d6-402a-b85d-6a0bc857746a/oauth2/error?originalUrl=https://e-menu.sunat.gob.pe/cl-ti-itmenu/AutenticaMenuInternet.htm&state=rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAADdAAEZXhlY3B0AAZwYXJhbXN0AEsqJiomL2NsLXRpLWl0bWVudS9NZW51SW50ZXJuZXQuaHRtJmI2NGQyNmE4YjVhZjA5MTkyM2IyM2I2NDA3YTFjMWRiNDFlNzMzYTZ0AANleGVweA
      await this._checkExternalPage();
    } else {
      // NOTE: actualmente hemos detectado que los errores
      // se están mostrando en las dos páginas referidas
      // NOTE: cuando descubramos una nueva página de error
      // la sentencia condicional se deberá extender
    }
  }
  /**
   * Esperar carga de página
   * @returns {void}
   */
  async _waitForPageLoad() {
    try {
      await WaitForPageLoadStateSupport(this.page).complete();
    } catch (error) {
      WebpageLoadingError.throwBecauseOf('Página principal del portal SOL');
    }
  }
  /**
   * Comprobar mensajes de error en formulario de inicio de sesión
   * @returns {void}
   */
  async _checkLoginForm() {
    await this._checkLoginError(this._loginFormErrorSelector());
  }
  /**
   * Comprobar mensajes de error en página redirigida
   * @returns {void}
   */
  async _checkExternalPage() {
    await this._checkLoginError(this._externalPageErrorSelector());
  }
  /**
   * Comprobar error de inicio de sesión
   * @param {string} selector Selector del error de inicio de sesión
   */
  async _checkLoginError(selector) {
    let message;

    try {
      message = await GetElementContentTextSupport(this.page, selector);
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Mensaje de error de logeo(${selector})`);
    }

    if (String(message ?? '').trim() === '') {
      UnexpectedError.throwBecauseOf('Error de logeo no encontrado');
    }

    InvalidCredentialsError.throwBecauseOf(message);
  }
  /**
   * Indica si se encuentra sobra la página de login
   * @returns {boolean}
   */
  _isOnLoginPage() {
    return this.page.url().search('/oauth2/loginMenuSol') !== -1;
  }
  /**
   * Indica si se encuentra sobre la página de error
   * @returns {boolean}
   */
  _isOnErrorPage() {
    return this.page.url().search('/oauth2/error') !== -1;
  }
  /**
   * Selector del error en el formulario de inicio de sesión
   * @returns {string}
   */
  _loginFormErrorSelector() {
    return 'span#spanMensajeError';
  }
  /**
   * Selector del error en la página redirigida
   * @returns {string}
   */
  _externalPageErrorSelector() {
    return 'div#divErrorRUC';
  }
}
