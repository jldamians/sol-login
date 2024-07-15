"use strict";

import { Page } from "puppeteer";

import { Taxpayer } from "../domain/models/Taxpayer.js";

import { StartSunatWebsiteSession } from "./StartSunatWebsiteSession.js";
import { CheckLoginFormErrorMessages } from "./CheckLoginErrorMessages.js";
import { GetLoggedUserProfileInfo } from "./GetLoggedUserProfileInfo.js";

/**
 * Módulo para realizar el inicio de sesión en el portal SOL de SUNAT
 * @param {Page} page Página
 */
export default function(page) {
  return {
    /**
     * Inicia sesión en el potal SOL de SUNAT
     * @param {Taxpayer} taxpayer Datos del contribuyente
     */
    login: async (taxpayer) => {
      await StartSunatWebsiteSession.onPage(page).login(taxpayer);

      await CheckLoginFormErrorMessages.onPage(page).check();

      return await GetLoggedUserProfileInfo.onPage(page).get();
    },
  }
}
