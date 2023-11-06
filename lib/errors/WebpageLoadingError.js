"use strict";

import { CustomErrorBase } from "./CustomErrorBase.js";
import { WEBPAGE_LOADING_ERROR } from "../constants/ErrorsConstant.js";

export class WebpageLoadingError extends CustomErrorBase {
  /**
   * @constructor
   * @param {string} message Mensaje de error
   * @param {string} code Código de error
   */
  constructor(message, code) {
    super(message, code);
    this.name = 'WebpageLoadingError';
  }

  /**
   * Lanzar error
   * @param {string | null} webpage Página web
   */
  static throwBecauseOf(webpage = null) {
    const { code, message } = WEBPAGE_LOADING_ERROR;
    const msg = `${message}${webpage ? `: ${webpage}` : ''}`;
    throw new WebpageLoadingError(msg, code);
  }
}
