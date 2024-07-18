"use strict";

import { Page } from "puppeteer";

import { TimeConverterUtil } from "../../utils/TimeConverterUtil.js";

/**
 * @constructor
 * @param {Page} pagina Página
 * @param {string} selector Selector del elemento
 * @param { { visible: boolean, timeout: number } } options Opciones
 */
export default async function(pagina, selector, options = {}) {
  const element = await pagina.waitForSelector(selector, {
    visible: options?.visible ?? true,
    timeout: options?.timeout ?? TimeConverterUtil(20).secsToMillis(),
  });

  const text = await (await element.getProperty('textContent')).jsonValue();

  return text.trim().replace(/[\n\t]/g, '');
}
