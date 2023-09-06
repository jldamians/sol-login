"use strict";

import { CustomErrorBase } from "./CustomErrorBase.js";
import { HTML_ELEMENT_NOT_FOUND_ERROR } from "../constants/ErrorsConstant.js";

class HTMLElementNotFoundError extends CustomErrorBase {
  /**
   * @constructor
   * @param {string} message Mensaje de error
   * @param {string} code Código de error
   */
  constructor(message, code) {
    super(message, code);
    this.name = 'HTMLElementNotFoundError';
  }

  /**
   * Lanzar error
   * @param {string | null} element Elemento HTML
   */
  static throwBecauseOf(element = null) {
    const { code, message } = HTML_ELEMENT_NOT_FOUND_ERROR;
    const msg = `${message}${element ? `: ${element}` : ''}`;
    throw new HTMLElementNotFoundError(msg, code);
  }
}

export { HTMLElementNotFoundError };
