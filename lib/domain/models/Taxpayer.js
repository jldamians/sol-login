"use strict";

import TaxpayerIdentification from "../value-objects/TaxpayerIdentifier.js";

export default class Taxpayer {
  /**
   * @constructor
   * @param {TaxpayerIdentification} identifier Registro Único de Contribuyente (RUC)
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
    return new this(TaxpayerIdentification.of(identifier), username, password);
  }
}
