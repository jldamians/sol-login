"use strict";

import { TaxpayerIdentificationVO } from "../value-objects/TaxpayerIdentifierVO.js";

export class Taxpayer {
  /**
   * @constructor
   * @param {TaxpayerIdentificationVO} identifier Registro Único de Contribuyente (RUC)
   * @param {string} username Usuario SOL
   * @param {string} password Clave SOL
   */
  constructor(identifier, username, password) {
    this._identifier = identifier;
    this._username = username;
    this._password = password;
  }

  /**
   * Registro Único de Contribuyente (RUC)
   * @returns {string}
   */
  get identifier() {
    return this._identifier.number;
  }
  /**
   * Usuario SOL
   * @returns {string}
   */
  get username() {
    return this._username;
  }
  /**
   * Clave SOL
   * @returns {string}
   */
  get password() {
    return this._password;
  }

  /**
   * Named constructor
   * @param {string} identifier Registro Único de Contribuyente
   * @param {string} username Usuario SOL
   * @param {string} password Clave SOL
   * @returns {Taxpayer}
   */
  static of(identifier, username, password) {
    return new this(TaxpayerIdentificationVO.of(identifier), username, password);
  }
}
