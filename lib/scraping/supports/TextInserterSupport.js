"use strict";

import { Page, Frame } from "puppeteer";

import { TimeConverterUtil } from "../../utils/TimeConverterUtil.js";
import { HTMLElementNotFoundError } from "../../errors/HTMLElementNotFoundError.js";

/**
 * Escribir sobre el elemento HTML
 * @param {Page | Frame} element - La página/frame actual.
 * @param {string} selector - El selector de elemento.
 * @param {string} value - El valor que deseamos ingresar.
 * @param {string | null} description - La descripción del elemento HTML.
 * @returns {Promise<void>}
 */
export default async function(element, selector, value, description = null) {
  let input;

  try {
    input = await element.waitForSelector(selector, {
      visible: true,
      timeout: TimeConverterUtil(30).secsToMillis(),
    });

    /**
     * digitar asi los valores, hace que se desencadenen los eventos de los inputs
     */
    await input.type(value);

    /*await element.evaluate((input, value) => {
      input.value = value;
    }, input, value);*/
  } catch ({ message }) {
    const msg = `${description ? `${description} (${selector})` : selector}`;
    HTMLElementNotFoundError.throwBecauseOf(`${msg} - ${message}`);
  }
}
