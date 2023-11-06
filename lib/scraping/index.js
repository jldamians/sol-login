"use strict";

import { Page } from "puppeteer";

import { Taxpayer } from "../domain/models/Taxpayer.js";

import { StartSunatWebsiteSession } from "./StartSunatWebsiteSession.js";
import { CheckLoginFormErrorMessages } from "./CheckLoginErrorMessages.js";
import { GetLoggedUserProfileInfo } from "./GetLoggedUserProfileInfo.js";

/**
 * Módulo para realizar el inicio de sesión en el portal SOL de SUNAT
 * @param {Page} page Página
 * @param {object} options - Opciones.
 * @param {boolean} options.visible - El indicador para esperar que el elemento está en el DOM y sea visible.
 * @param {boolean} options.click - El indicador para decirle si se hará "click" o "focus" sobre elemento.
 */
export default function(page, options = {}) {
  return {
    /**
     * Inicia sesión en el potal SOL de SUNAT
     * @param {Taxpayer} taxpayer Datos del contribuyente
     */
    login: async (taxpayer) => {
      await StartSunatWebsiteSession.onPage(page, options).login(taxpayer);

      await CheckLoginFormErrorMessages.onPage(page).check();

      return await GetLoggedUserProfileInfo.onPage(page).get();
    },
  }
}
