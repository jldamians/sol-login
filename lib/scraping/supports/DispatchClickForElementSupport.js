"use strict";

import { Page } from "puppeteer";

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

  await pagina.waitForTimeout(TimeConverterUtil(1.5).secsToMillis());

  /**
   * Esperamos que la opción esté presente en
   * el DOM, y además que esté visible.
   * NOTE: Si la opción del menú no está desplegada y además visible en el DOM
   * puppeteer nunca encontraría el elemento, por eso consignamos ``` visible: true ```
   */
	try {
		button = await pagina.waitForSelector(selector, {
			visible: true,
			timeout: TimeConverterUtil(30).secsToMillis(),
		});
	} catch ({ message }) {
    const msg = `${description ? `${description} (${selector})` : selector}`;
		HTMLElementNotFoundError.throwBecauseOf(`${msg} - ${message}`);
	}

  await pagina.waitForTimeout(TimeConverterUtil(1.5).secsToMillis());

  // Click en la opción.
  // NOTA: Cuando un elemento presente en el DOM no es visible,
  // esta es la única forma de acceder a su evento click.
  await pagina.evaluate((button) => {
    button.click();
  }, button);

  // Click en la opción.
  // NOTA:  Hacemos click sobre el elemento,
  // cuando esté presente en el DOM y visible.
  //button.click();
}
