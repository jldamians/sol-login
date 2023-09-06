"use strict";

import { Page } from "puppeteer";

import { HTMLElementNotFoundError } from "../errors/HTMLElementNotFoundError.js";

import GetElementContentTextSupport from "./supports/GetElementContentTextSupport.js";

export default class GetLoggedUserProfileInfo {
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
   * @returns {GetLoggedUserProfileInfo}
   */
  static onPage(page) {
    return new this(page);
  }

  /**
   * Obtener datos del perfil logeado
   * @returns { {
   *  fechaHoraLogeo: string,
   *  estadoDireccionFiscal: string,
   *  nombresContribuyente: string
   * } }
   */
  async get() {
    let loginDateTime;
    let fiscalAddressStatus;
    let taxpayerNames;

    try {
      loginDateTime = await GetElementContentTextSupport(this.page, this._loginDateTimeSelector());
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Fecha y hora del inicio de sesión(${this._loginDateTimeSelector()})`);
    }

    try {
      fiscalAddressStatus = await GetElementContentTextSupport(this.page, this._fiscalAddressStatusSelector());
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Dirección fiscal(${this._fiscalAddressStatusSelector()})`);
    }

    try {
      taxpayerNames = await GetElementContentTextSupport(this.page, this._taxpayerNamesSelector());
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Nombres del contribuyente(${this._taxpayerNamesSelector()})`);
    }

    return {
      fechaHoraLogeo: loginDateTime,
      estadoDireccionFiscal: fiscalAddressStatus,
      nombresContribuyente: taxpayerNames,
    };
  }

  /**
   * Selector del elemento que contiene fecha y hora de logeo
   * @returns {string}
   */
  _loginDateTimeSelector() {
    return 'div#divNavAzul p span';
  }
  /**
   * Selector del elemento que contiene la dirección fiscal del contribuyente logeado
   * @returns {string}
   */
  _fiscalAddressStatusSelector() {
    return 'li.liEstadoDomicilio p span.spanEstadoDomicilio';
  }
  /**
   * Selector del elemento que contiene los nombres del contribuyente logeado
   * @returns {string}
   */
  _taxpayerNamesSelector() {
    return 'li#liOpcionUsuario2 ul.dropdown-menu li.dropdown-header:first-child strong';
  }
}
