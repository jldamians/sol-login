"use strict";

import { Page } from 'puppeteer';

import { Taxpayer } from "../domain/models/Taxpayer.js";

import TextInserterSupport from "./supports/TextInserterSupport.js";
import WaitForPageLoadStateSupport from "./supports/WaitForPageLoadStateSupport.js";
import DispatchClickForElementSupport from "./supports/DispatchClickForElementSupport.js";

import { WebpageLoadingError } from "../errors/WebpageLoadingError.js";
import { HTMLElementNotFoundError } from "../errors/HTMLElementNotFoundError.js";

export class StartSunatWebsiteSession {
  /**
   * @constructor
   * @param {Page} page Página
   * @param {object} options - Opciones.
   * @param {boolean} options.visible - El indicador para esperar que el elemento está en el DOM y sea visible.
   * @param {boolean} options.click - El indicador para decirle si se hará "click" o "focus" sobre elemento.
   */
  constructor(page, options) {
    this.page = page;
    this.options = options;
  }

  /**
   * Instanciar con página
   * @param {Page} page Página
   * @param {object} options - Opciones.
   * @param {boolean} options.visible - El indicador para esperar que el elemento está en el DOM y sea visible.
   * @param {boolean} options.click - El indicador para decirle si se hará "click" o "focus" sobre elemento.
   * @returns {StartSunatWebsiteSession}
   */
  static onPage(page, options) {
    return new this(page, options);
  }

  /**
   * Ingresar las credenciales
   * @param {Taxpayer} taxpayer Contribuyente
   */
  async login(taxpayer) {
    await this._waitForPageLoad();

    await this._typeIdentifier(taxpayer.identifier);

    await this._typeUsername(taxpayer.username);

    await this._typePassword(taxpayer.password);

    await this._clickLoginButton();
  }

  /**
   * Esperar carga de página
   * @returns {void}
   */
  async _waitForPageLoad() {
    try {
      await WaitForPageLoadStateSupport(this.page).documentComplete();
    } catch (error) {
      WebpageLoadingError.throwBecauseOf('Esperar carga formulario inicio de sesión');
    }
  }
  /**
   * Escribir el Registro Único de Contribuyente
   * @param {string} identifier Registro Único de Contribuyente
   * @returns {void}
   */
  async _typeIdentifier(identifier) {
    try {
      await TextInserterSupport(this.page, this._identifierInputBoxSelector(), identifier, {
        visible: this.options.visible,
        click: this.options.click
      });
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Caja de texto de RUC(${this._identifierInputBoxSelector()})`);
    }
  }
  /**
   * Escribir el Usuario SOL
   * @param {string} username Usuario SOL
   * @returns {void}
   */
  async _typeUsername(username) {
    try {
      await TextInserterSupport(this.page, this._usernameInputBoxSelector(), username, {
        visible: this.options.visible,
        click: this.options.click
      });
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Caja de texto de Usuario(${this._usernameInputBoxSelector()})`);
    }
  }
  /**
   * Escribir la Clave SOL
   * @param {string} password Clave SOL
   * @returns {void}
   */
  async _typePassword(password) {
    try {
      await TextInserterSupport(this.page, this._passwordInputBoxSelector(), password, {
        visible: this.options.visible,
        click: this.options.click
      });
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Caja de texto de Clave(${this._passwordInputBoxSelector()})`);
    }
  }
  /**
   * Click botón iniciar sesión
   * @returns {void}
   */
  async _clickLoginButton() {
    try {
      await DispatchClickForElementSupport(this.page, this._loginButtonSelector())
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Botón de iniciar sesión(${this._loginButtonSelector()})`);
    }
  }
  /**
   * Selector del input box: Registro Único del Contribuyente
   * @returns {string}
   */
  _identifierInputBoxSelector() {
    return 'input#txtRuc';
  }
  /**
   * Selector del input box: Usuario SOL
   * @returns {string}
   */
  _usernameInputBoxSelector() {
    return 'input#txtUsuario';
  }
  /**
   * Selector del input box: Clave SOL
   * @returns {string}
   */
  _passwordInputBoxSelector() {
    return 'input#txtContrasena';
  }
  /**
   * Selector del botón: Iniciar sesión
   * @returns {string}
   */
  _loginButtonSelector() {
    return 'button#btnAceptar';
  }
}
