"use strict";

import { Page } from "puppeteer";

import { TimeConverterUtil } from "../../utils/TimeConverterUtil";

/**
 * @typedef {Object} ReCaptchaInfo
 * @property {string} id - Identificador único del reCAPTCHA.
 * @property {string} siteKey - Clave del sitio.
 * @property {string} pageUrl - URL de la página.
 */

/**
 * Extrae información del reCAPTCHA v2 de google.
 * @param {Page} page - La página.
 * @returns {Promise<ReCaptchaInfo | null>}
 */
export default async function(page) {
  // Nos aseguramos que la página tenga cargado el reCAPTCHA de google
  try {
    await page.waitForFunction(() => {
      return window.___grecaptcha_cfg && window.___grecaptcha_cfg.count && window.___grecaptcha_cfg.clients;
    }, {
      polling: TimeConverterUtil(1).secsToMillis(),
      timeout: TimeConverterUtil(30).secsToMillis(),
    });
  } catch ({message}) {
    //throw new Error(`No se ha encontrado recaptcha en la página: ${message}`);
    return null;
  }

  const recaptcha = await page.evaluate(() => {
    // obtenemos todos los elemento reCAPTCHA de google que existen en la web
    const $iframes = Array.from(
      document.querySelectorAll('iframe[src^="https://www.google.com/recaptcha/api2/anchor"][name^="a-"]')
    );

    return $iframes
      .filter(($iframe) => {
        // validamos que el elemento iframe tenga los atributos necesarios (src & name)
        const attribute = $iframe.getAttribute('src') && $iframe.getAttribute('name');

        if (!attribute) {
          return false;
        }
        // validamos que el elemento iframe sea visible
        return !$iframe.src.includes('invisible');
      }).map(($iframe) => {
        let id, siteKey;
        // pintamos el logo del reCAPTCHA como indicador de que ha sido identificado
        $iframe.style.filter = `opacity(60%) hue-rotate(400deg)`; // violet
        // obtenemos el identificado único del reCAPTCHA,
        // separando el texto después del guión (a-sq4acfbm3g)
        id = $iframe.getAttribute('name').split('-').slice(-1).shift();
        // metemos a un objeto los parámetros de la url del atributo "src" del elemento "iframe"
        const hashes = $iframe.src.slice($iframe.src.indexOf('?') + 1).split('&');
        // obtenemos el valor del "siteKey" del reCAPTCHA
        hashes.forEach((hash) => {
          const [key, val] = hash.split('=');

          if (key === 'k') {
            siteKey = decodeURIComponent(val);
          }
        });

        return { id, siteKey };
      }).shift();
  });

  return {
    ...recaptcha,
    pageUrl: page.url()
  };
}
