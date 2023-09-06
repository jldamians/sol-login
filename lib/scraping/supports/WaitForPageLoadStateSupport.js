"use strict";

import { Frame, Page } from "puppeteer";

import ReadyStatesConstant from "../../constants/ReadyStatesConstant.js";

/**
 * Esperar el estado de carga de la página
 * @param {Page | Frame} element Elemento HTML
 * @param {{ polling: number, timeout: number }} options Opciones
 */
export default function(element, options) {
  /**
   * Esperar por el estado de carga especificado
   * @param {string | string[]} state Estado(s) de carga del documento
   * @returns {void}
   */
  const waitingFor = async (state) => {
    let readyStates = [];

    if (typeof state === 'string') {
      readyStates = [ state ];
    } else if (Array.isArray(state)) {
      readyStates = [ ...state ];
    } else {
      readyStates = [ ReadyStatesConstant.COMPLETE ];
    }

    await element.waitForFunction((readyStates) => {
      return readyStates.includes(document.readyState);
    }, {
      polling: options?.polling ?? 1 * 1000,
      timeout: options?.timeout ?? 20 * 1000,
    }, readyStates);
  }
  // TODO: soportar la búsqueda de múltiples estados
  return {
    /**
     * El documento todavía está cargando
     */
    loading: async () => await waitingFor([ReadyStatesConstant.LOADING]),
    /**
     * El documento terminó de cargarse, pero sus recursos aún están cargando
     */
    interactive: async () => await waitingFor([ReadyStatesConstant.INTERACTIVE]),
    /**
     * El documento y sus recursos han terminado de cargarse
     */
    complete: async () => await waitingFor([ReadyStatesConstant.COMPLETE]),
    /**
     * El documento ha cargado. Se ignora el estado de carga de sus recursos
     */
    documentComplete: async () => await waitingFor([ReadyStatesConstant.INTERACTIVE, ReadyStatesConstant.COMPLETE]),
  }
}
