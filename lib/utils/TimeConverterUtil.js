"use strict";

/**
 * Convertidor de unidades de tiempo
 * @param {number} time Tiempo
 */
export const TimeConverterUtil = (time) => {
  // Verificar que tiempo sea un número válido
  if (typeof time !== 'number' || isNaN(time)) {
    throw new Error('El valor proporcionado no es un número válido de tiempo');
  }

  return {
    /**
     * Convertir segundos a milisegundos
     * @returns {number} milisegundos
     */
    secsToMillis: () => {
      return 1000 * time;
    },
    /**
     * convertir minutos a milisegundos
     * @returns {number} milisegundos
     */
    minsToMillis: () => {
      return 1000 * 60 * time;
    },
  }
}
