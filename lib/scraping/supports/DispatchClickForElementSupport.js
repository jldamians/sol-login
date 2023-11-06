"use strict";

import { Frame, Page } from "puppeteer";

import { TimeConverterUtil } from "../../utils/TimeConverterUtil.js";

/**
 * Click sobre el elemento HTML
 * @param {Page | Frame} element Elemento HTML
 * @param {string} selector Selector del elemento sobre el que haremos click
 * @param {{ visible: boolean, timeout: number }} options Opciones
 */
export default async function(element, selector, options = {}) {
  /**
   * Esperamos que la opción esté presente en
   * el DOM sin importar que esté visible
   * NOTE: Si la opción del menú no está desplegada
   * puppeteer nunca encontraría el elemento, por eso
   * consignamos ``` visible: false ```
   */
  await element.waitForSelector(selector, {
    visible: options?.visible ?? false,
    timeout: options?.timeout ?? TimeConverterUtil(10).secsToMillis(),
  });

  /**
   * Click en la opción.
   * NOTE: Cuando un elemento presente en el DOM no es visible,
   * esta es la única forma de acceder a su evento click.
   */
  await element.evaluate((optionSelector) => {
    document.querySelector(optionSelector).click();
  }, selector);
}
