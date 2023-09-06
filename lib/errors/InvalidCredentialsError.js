"use strict";

import CustomErrorBase from "./CustomErrorBase.js";

import { INVALID_CREDENTIALS_ERROR } from "../constants/ErrorsConstant.js";

export default class InvalidCredentialsError extends CustomErrorBase {
  /**
   * @constructor
   * @param {string} message Mensaje de error
   * @param {string} code Código de error
   */
  constructor(message, code) {
    super(message, code);
    this.name = 'InvalidCredentialsError';
  }

  /**
   * Lanzar error
   * @param {string | null} error Detalle del error
   */
  static throwBecauseOf(error = null) {
    const { code, message } = INVALID_CREDENTIALS_ERROR;
    const msg = `${message}${error ? `: ${error}` : ''}`;
    throw new InvalidCredentialsError(msg, code);
  }
}
