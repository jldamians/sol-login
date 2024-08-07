"use strict";

import { HTTPRequest, Page } from "puppeteer";

import { Taxpayer } from "./domain/models/Taxpayer.js";

import SunatLoginHandler from "./scraping/index.js";

/**
 * Intercepta y modifica la respuesta de la solicitud de campañas
 * @param {HTTPRequest} request - La solicitud
 * @returns {Promise<void>}
 */
const requestInterceptor = async request => {
  /**
   * estas son las campañas que se muestran en la página de inicio en forma de pop-up,
   * lo que hacemos es falsear la respuesta para que no se muestren
   */
  const newJsonResponse = [{
    "nombreCampania":"NotificacionPorLeer",
    "existe":false,
    "url":""
  }, {
    "nombreCampania":"ModificaDatosRuc",
    "existe":false,
    "url":""
  },{
    "nombreCampania":"PreguntasXRuc",
    "existe":false,
    "url":""
  },{
    "nombreCampania":"CIIU",
    "existe":false,
    "url":""
  },{
    "nombreCampania":"DomicioFiscal",
    "existe":false,
    "url":""
  },{
    "nombreCampania":"CampanhaPerfil",
    "existe":false,
    "url":""
  }];

  const isIntercept = request.isInterceptResolutionHandled();

  if (isIntercept) {
    return;
  }

  const isCampaignsRequest = (
    request.url().search('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm') !== -1 &&
    request.method() === 'POST' &&
    request.postData() === 'action=campana'
  );

  if (isCampaignsRequest) {
    await request.respond({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(newJsonResponse),
    });
  } else {
    request.continue();
  }
};

/**
 * Módulo de inicio de sesión
 * @param {Page} page Página.
 * @param {object} options - Opciones.
 * @param {boolean} options.interception - El indicador para activar la interceptación de peticiones.
 */
export default function(page, options = {}) {
  const intercepted = options.interception ?? false;

  if (intercepted) {
    page.on('request', requestInterceptor);
  }

  return {
    /**
     * Iniciar sesión
     * @param {string} ruc Registro Único de Contribuyente
     * @param {string} user Usuario SOL
     * @param {string} pass Clave SOL
     * @returns {Promise<void>}
     */
    login: async (ruc, user, pass) => {
      const taxpayer = Taxpayer.of(ruc, user, pass);

      await SunatLoginHandler(page).login(taxpayer);
    },
  };
}

// utils
export { TimeConverterUtil } from './utils/TimeConverterUtil.js';
// errors
export { CustomErrorBase } from './errors/CustomErrorBase.js';
export { WebpageLoadingError } from './errors/WebpageLoadingError.js';
export { InvalidCredentialsError } from './errors/InvalidCredentialsError.js';
export { HTMLElementNotFoundError } from './errors/HTMLElementNotFoundError.js';
export { InvalidTaxpayerIdentifierError } from './errors/InvalidTaxpayerIdentifierError.js';
// constants
export * from './constants/ErrorsConstant.js';
export * from './constants/ReadyStatesConstant.js';
// supports
export {
  TextInserterSupport,
  WaitForPageLoadStateSupport,
  GetElementContentTextSupport,
  DispatchClickForElementSupport,
} from './scraping/supports/index.js';
