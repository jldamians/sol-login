"use strict";

import { Frame, Page } from "puppeteer";

import { TimeConverterUtil } from "../../utils/TimeConverterUtil.js";
import { HTMLElementNotFoundError } from "../../errors/HTMLElementNotFoundError.js";

/**
 * Ir a una opción de menú
 * @param {Page} pagina - La página.
 * @param {string} selector - El selector del elemento.
 * @param {Options} options - Las opciones.
 */
export default async function(pagina, selector, description = null) {
  let button;
  /**
   * Esperamos que la opción esté presente en
   * el DOM, y además que esté visible.
   * NOTE: Si la opción del menú no está desplegada y además visible en el DOM
   * puppeteer nunca encontraría el elemento, por eso consignamos ``` visible: true ```
   */
	try {
		button = await pagina.waitForSelector(selector, {
			visible: true, //options.visible ?? false,
			timeout: TimeConverterUtil(30).secsToMillis(), //options.timeout ?? TimeConverterUtil(10).secsToMillis(),
		});
	} catch ({ message }) {
    const msg = `${description ? `${description} (${selector})` : selector}`;
		HTMLElementNotFoundError.throwBecauseOf(`${msg} - ${message}`);
	}

  button.click();

  // Click en la opción.
  // NOTA: Cuando un elemento presente en el DOM no es visible,
  // esta es la única forma de acceder a su evento click.
  /*await pagina.evaluate((button) => {
    button.click();
  }, button);*/
}

/**
 * Click sobre el elemento HTML
 * @param {Page | Frame} element Elemento HTML
 * @param {string} selector Selector del elemento sobre el que haremos click
 * @param {{ visible: boolean, timeout: number }} options Opciones
 */
//export default async function(element, selector, options = {}) {
  /**
   * Esperamos que la opción esté presente en
   * el DOM sin importar que esté visible
   * NOTE: Si la opción del menú no está desplegada
   * puppeteer nunca encontraría el elemento, por eso
   * consignamos ``` visible: false ```
   */
  /*await element.waitForSelector(selector, {
    visible: options?.visible ?? false,
    timeout: options?.timeout ?? TimeConverterUtil(15).secsToMillis(),
  });*/

  /**
   * Click en la opción.
   * NOTE: Cuando un elemento presente en el DOM no es visible,
   * esta es la única forma de acceder a su evento click.
   */
  /*await element.evaluate((optionSelector) => {
    document.querySelector(optionSelector).click();
  }, selector);*/
//}
