"use strict";

import { Frame, Page } from "puppeteer";

import {
  LOADING_STATE,
  INTERACTIVE_STATE,
  COMPLETE_STATE,
} from "../../constants/ReadyStatesConstant.js";
import { TimeConverterUtil } from "../../utils/TimeConverterUtil.js";

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
      readyStates = [ COMPLETE_STATE ];
    }

    await element.waitForFunction((readyStates) => {
      return readyStates.includes(document.readyState);
    }, {
      polling: options?.polling ?? TimeConverterUtil(1).secsToMillis(),
      timeout: options?.timeout ?? TimeConverterUtil(60).secsToMillis(),
    }, readyStates);
  }
  // TODO: soportar la búsqueda de múltiples estados
  return {
    /**
     * El documento todavía está cargando
     */
    loading: async () => await waitingFor([LOADING_STATE]),
    /**
     * El documento terminó de cargarse, pero sus recursos aún están cargando
     */
    interactive: async () => await waitingFor([INTERACTIVE_STATE]),
    /**
     * El documento y sus recursos han terminado de cargarse
     */
    complete: async () => await waitingFor([COMPLETE_STATE]),
    /**
     * El documento ha cargado. Se ignora el estado de carga de sus recursos
     */
    documentComplete: async () => await waitingFor([INTERACTIVE_STATE, COMPLETE_STATE]),
  }
}
