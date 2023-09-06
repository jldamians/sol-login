"use strict";

import { CustomErrorBase } from "./CustomErrorBase.js";

import { INVALID_TAXPAYER_IDENTIFIER_ERROR } from "../constants/ErrorsConstant.js";

class InvalidTaxpayerIdentifierError extends CustomErrorBase {
  /**
   * @constructor
   * @param {string} message Mensaje de error
   * @param {string} code Código de error
   */
  constructor(message, code) {
    super(message, code);
    this.name = 'InvalidTaxpayerIdentifierError';
  }

  /**
   * Lanzar error
   * @param {string | null} identifier Registro Único del Contribuyente
   */
  static throwBecauseOf(identifier = null) {
    const { code, message } = INVALID_TAXPAYER_IDENTIFIER_ERROR;
    const msg = `${message}${identifier ? `: ${identifier}` : ''}`;
    throw new InvalidTaxpayerIdentifierError(msg, code);
  }
}

export { InvalidTaxpayerIdentifierError };
