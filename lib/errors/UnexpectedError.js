"use strict";

import { CustomErrorBase } from "./CustomErrorBase.js";
import { UNEXPECTED_ERROR } from "../constants/ErrorsConstant.js";

export class UnexpectedError extends CustomErrorBase {
  /**
   * @constructor
   * @param {string} message - El mensaje de error
   * @param {string} code - El código de error
   */
  constructor(message, code) {
    super(message, code);
    this.name = 'UnexpectedError';
  }

  /**
   * Lanzar error
   * @param {string | null} detail - El detalle del error
   */
  static throwBecauseOf(detail = null) {
    const { code, message } = UNEXPECTED_ERROR;
    const msg = `${message}${detail ? `: ${detail}` : ''}`;
    throw new UnexpectedError(msg, code);
  }
}
