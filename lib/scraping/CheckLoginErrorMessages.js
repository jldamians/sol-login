"use strict";

import { Page } from "puppeteer";

import WebpageLoadingError from "../errors/WebpageLoadingError.js";
import InvalidCredentialsError from "../errors/InvalidCredentialsError.js";
import HTMLElementNotFoundError from "../errors/HTMLElementNotFoundError.js";

import WaitForPageLoadStateSupport from "./supports/WaitForPageLoadStateSupport.js";
import GetElementContentTextSupport from "./supports/GetElementContentTextSupport.js";

export default class CheckLoginFormErrorMessages {
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
     * En caso de éxito: Se redireccionará al portal SOL de la SUNAT
     * En caso de error: Puede que sea redireccionado a una página en
     * donde se muestra la falla en la autenticación, o puede que los
     * errores de validación sean mostrados en el mismo formulario
     * de inicio de sesión
     */

    /**
     * Tras realizar el inicio de sesión.
     * SI hay redireccionamiento: Esperamos
     * a que la página cargue con o sin sus recursos
     * NO hay redireccionamiento: No tendremos
     * que esperar la carga de la página puesto que está cargada
     */
    await this._waitForPageLoad();

    if (this._isOnLoginPage()) {

      await this._checkLoginForm();

    } else if (this._isOnErrorPage()) {

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
      await WaitForPageLoadStateSupport(this.page).documentComplete();
    } catch (error) {
      WebpageLoadingError.throwBecauseOf('Post inicio de sesión');
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
