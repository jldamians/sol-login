"use strict";

/**
 * Enumeración de los estados de carga de la página
 * @enum {string}
 */
export default {
  /**
   * El documento todavía se está cargando
   * @type {string}
   */
  LOADING: 'loading',
  /**
   * El documento terminó de cargarse, pero los subrecursos aún se están cargando
   * @type {string}
   */
  INTERACTIVE: 'interactive',
  /**
   * El documento y todos los subrecursos han terminado de cargarse
   * @type {string}
   */
  COMPLETE: 'complete',
};
