"use strict";

import { Page } from "puppeteer";

import { TimeConverterUtil } from "../../utils/TimeConverterUtil.js";

/**
 * Digitar sobre el elemento HTML
 * @param {Page} element - La página actual.
 * @param {string} selector - El selector de elemento.
 * @param {string} value - El valor que deseamos ingresar.
 * @param {object} options - Opciones.
 * @param {boolean} options.visible - El indicador para esperar que el elemento está en el DOM y sea visible.
 * @param {number} options.timeout - El tiempo de espera.
 * @param {boolean} options.click - El indicador para decirle si se hará "click" o "focus" sobre elemento.
 */
export default async function(element, selector, value, options = {}) {
  const visible = options?.visible ?? true;
  const timeout = options?.timeout ?? TimeConverterUtil(15).secsToMillis();
  const click = options?.click ?? false;
  const input = await element.waitForSelector(selector, {
    visible,
    timeout,
  });

  if (visible) {
    if (click) {
      const inputBoundingBox = await input.boundingBox();
      const centerX = inputBoundingBox.x + inputBoundingBox.width / 2;
      const centerY = inputBoundingBox.y + inputBoundingBox.height / 2;

      await element.mouse.move(centerX, centerY);
      await element.mouse.click(centerX, centerY);
    } else {
      await input.focus();
    }

    await input.type(value);
  } else {
    await element.evaluate((input, value) => {
      input.value = value;
    }, input, value);
  }
}
