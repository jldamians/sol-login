"use strict";

import { Page } from 'puppeteer';

import TextInserterSupport from "./supports/TextInserterSupport.js";
import WaitForPageLoadStateSupport from "./supports/WaitForPageLoadStateSupport.js";
import DispatchClickForElementSupport from "./supports/DispatchClickForElementSupport.js";

import { Taxpayer } from "../domain/models/Taxpayer.js";
import { TimeConverterUtil } from '../utils/TimeConverterUtil.js';
import { WebpageLoadingError } from "../errors/WebpageLoadingError.js";

import { RUC_LOGIN_TYPE } from "../constants/LoginTypesConstant.js";

export class StartSunatWebsiteSession {
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
   * @returns {StartSunatWebsiteSession}
   */
  static onPage(page) {
    return new this(page);
  }

  /**
   * Ingresar las credenciales
   * @param {Taxpayer} taxpayer Contribuyente
   */
  async login(taxpayer) {
    await this._waitForPageLoad();

    await this._selectIdentifierType(RUC_LOGIN_TYPE);

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
      await WaitForPageLoadStateSupport(this.page).complete();
    } catch (error) {
      WebpageLoadingError.throwBecauseOf('Inicio de sesión');
    }
  }
  /**
   * Seleccionar el tipo de identificador
   * @param {string} code - El código del tipo de identificador (ruc o dni)
   * @returns {void}
   */
  async _selectIdentifierType(code) {
    const identifierTypeSelector = code === RUC_LOGIN_TYPE ? 'button#btnPorRuc' : 'button#btnPorDni';
    const identifierTypeLabel = code === RUC_LOGIN_TYPE ? 'RUC' : 'DNI';

    await DispatchClickForElementSupport(
      this.page,
      identifierTypeSelector,
      `Opción de logeo con ${identifierTypeLabel}`,
    );
  }
  /**
   * Escribir el RUC (Registro Único de Contribuyente)
   * @param {string} identifier Registro Único de Contribuyente
   * @returns {void}
   */
  async _typeIdentifier(identifier) {
    await TextInserterSupport(
      this.page,
      this._identifierInputBoxSelector(),
      identifier,
      'Número de RUC'
    );
  }
  /**
   * Escribir el Usuario SOL
   * @param {string} username Usuario SOL
   * @returns {void}
   */
  async _typeUsername(username) {
    await TextInserterSupport(
      this.page,
      this._usernameInputBoxSelector(),
      username,
      'Usuario SOL'
    );
  }
  /**
   * Escribir la Clave SOL
   * @param {string} password Clave SOL
   * @returns {void}
   */
  async _typePassword(password) {
    await TextInserterSupport(
      this.page,
      this._passwordInputBoxSelector(),
      password,
      'Clave SOL',
    );
  }
  /**
   * Click en el botón iniciar sesión
   * @returns {void}
   */
  async _clickLoginButton() {
    await Promise.all([
      await DispatchClickForElementSupport(
        this.page,
        this._loginButtonSelector(),
        'Botón de iniciar sesión',
      ),
      // esperar la navegación si ocurre
      this.page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: TimeConverterUtil(30).secsToMillis(),
      }).catch(() => {}),
    ]);
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
