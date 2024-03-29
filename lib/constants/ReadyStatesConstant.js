"use strict";

/**
 * El documento todavía se está cargando
 * @type {string}
 */
export const LOADING_STATE = 'loading';
/**
 * El documento terminó de cargarse, pero los subrecursos aún se están cargando
 * @type {string}
 */
export const INTERACTIVE_STATE = 'interactive';
/**
 * El documento y todos los subrecursos han terminado de cargarse
 * @type {string}
 */
export const COMPLETE_STATE = 'complete';
