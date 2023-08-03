class Time {
  /**
   * Convertir segundos a milisegundos
   * @param {number} value
   * @returns {number}
   */
  static getSeconds(value) {
    return 1000 * value;
  }
}

module.exports = Time;
