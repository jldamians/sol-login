"use strict";

import { Page } from "puppeteer";

import { Taxpayer } from "./domain/models/Taxpayer.js";

import SOLLoginWebsite from "./scraping/index.js";

/**
 * Módulo de inicio de sesión
 * @param {Page} page Página
 */
export default function(page) {
  return {
    /**
     * Iniciar sesión
     * @param {string} ruc Registro Único de Contribuyente
     * @param {string} user Usuario SOL
     * @param {string} pass Clave SOL
     * @returns { {
     *  addressStatus: string,
     *  names: string,
     * } }
     */
    login: async (ruc, user, pass) => {
      return await SOLLoginWebsite(page).login(Taxpayer.of(ruc, user, pass));
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
