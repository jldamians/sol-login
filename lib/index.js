"use strict";

import { Page } from "puppeteer";

import Taxpayer from "./domain/models/Taxpayer.js";

import WebsiteSOL from "./scraping/index.js";

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
     *  fechaHoraLogeo: string,
     *  estadoDireccionFiscal: string,
     *  nombresContribuyente: string,
     * } }
     */
    login: async (ruc, user, pass) => {
      return await WebsiteSOL(page).login(Taxpayer.of(ruc, user, pass));
    },
  };
}

export * from './utils/index.js';
export * from './errors/index.js';
export * from './constants/index.js';
export * from './scraping/supports/index.js';
