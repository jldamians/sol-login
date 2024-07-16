"use strict";

import { Page } from "puppeteer";

import { HTMLElementNotFoundError } from "../errors/HTMLElementNotFoundError.js";

import GetElementContentTextSupport from "./supports/GetElementContentTextSupport.js";

export class GetLoggedUserProfileInfo {
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
   * Obtiene datos del perfil
   * @returns { {
   *  addressStatus: string,
   *  names: string
   * } }
   */
  async get() {
    //let loginDatetime;
    let addressStatus;
    let names;

    /*try {
      loginDatetime = await GetElementContentTextSupport(this.page, this._loginDatetimeSelector());
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Fecha y hora del inicio de sesión(${this._loginDatetimeSelector()})`);
    }*/

    try {
      addressStatus = await GetElementContentTextSupport(this.page, this._fiscalAddressStatusSelector());
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Dirección fiscal(${this._fiscalAddressStatusSelector()})`);
    }

    try {
      names = await GetElementContentTextSupport(this.page, this._namesSelector());
    } catch (error) {
      HTMLElementNotFoundError.throwBecauseOf(`Nombres del contribuyente(${this._namesSelector()})`);
    }

    return {
      //loginDatetime,
      addressStatus,
      names,
    };
  }

  /**
   * Selector del elemento que contiene fecha y hora de logeo
   * @returns {string}
   */
  /*_loginDatetimeSelector() {
    return 'div#divNavAzul p span';
  }*/
  /**
   * Selector del elemento que contiene la dirección fiscal del contribuyente logeado
   * @returns {string}
   */
  _fiscalAddressStatusSelector() {
    return 'li.liEstadoDomicilio p span.spanEstadoDomicilio, a.spanEstadoDomicilio';
  }
  /**
   * Selector del elemento que contiene los nombres del contribuyente logeado
   * @returns {string}
   */
  _namesSelector() {
    return 'li#liOpcionUsuario2 ul.dropdown-menu li.dropdown-header:first-child strong';
  }
}
