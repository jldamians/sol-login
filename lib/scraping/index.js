"use strict";

import { Page } from "puppeteer";

import Taxpayer from "../domain/models/Taxpayer.js";

import StartSunatWebsiteSession from "./StartSunatWebsiteSession.js";
import CheckLoginFormErrorMessages from "./CheckLoginErrorMessages.js";
import GetLoggedUserProfileInfo from "./GetLoggedUserProfileInfo.js";

/**
 * Administrar inicio de sesión
 * @param {Page} page Página
 */
export default function(page) {
  return {
    /**
     * Iniciar sesión
     * @param {Taxpayer} taxpayer Datos del contribuyente
     */
    login: async (taxpayer) => {
      await StartSunatWebsiteSession.onPage(page).login(taxpayer);

      await CheckLoginFormErrorMessages.onPage(page).check();

      return await GetLoggedUserProfileInfo.onPage(page).get();
    },
  }
}
