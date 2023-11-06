"use strict";

import { InvalidTaxpayerIdentifierError } from "../../errors/InvalidTaxpayerIdentifierError.js";

export class TaxpayerIdentificationVO {
  /**
   * @constructor
   * @param {string} number
   */
  constructor(number) {
    this._setNumber(number);
  }

  /**
   * Registro Único de Contribuyente (RUC)
   * @returns {string}
   */
  get number() {
    return this._value;
  }

  /**
   * Named constructor
   * @param {string} number Número de RUC
   * @returns {TaxpayerIdentificationVO}
   */
  static of(number) {
    return new this(number);
  }

  /**
   * Self encapsulation
   * @param {string} number Número de RUC
   */
  _setNumber(number) {
    this._checkNumber(number);
    this._value = number;
  }

  /**
   * Guard clause
   * @param {string} number Número de RUC
   */
  _checkNumber(number) {
    const isValidNumber = this._isValid(number);

    if (!isValidNumber) {
      InvalidTaxpayerIdentifierError.throwBecauseOf(number);
    }
  }

  /**
   * Calcular la suma de verificación
   * @param {Array<number>} digits Dígitos
   * @returns {number}
   */
  _checksum(digits) {
    /**
     * factores de chequeo ponderado para cada uno
     * de los primeros diez (10) dígitos del número de ruc
     */
    const checkFactors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    /**
     * multiplicamos cada uno de los primeros diez (10)
     * dígitos por su factor de chequeo asignado
     */
    const checksum = digits.reduce(function (previous, current, index) {
      return previous + (current * checkFactors[index]);
    }, 0);

    /**
     * al resultado de la suma de todas las multiplicaciones,
     * se le calcula el modulo 11, es decir, el resto de la división entre once (11)
     */
    const module11 = checksum % 11;

    /**
     * al número once (11) le restamos el resultado del módulo once (11) calculado
     */
    const complement = 11 - module11;

    /**
     * calculamos el modulo 10
     */
    return complement % 10;
  }

  /**
   * Validar si el número de RUC es correcto
   * @param {string} number Número de RUC
   * @returns {boolean}
   */
  _isValid(number) {
    const regexp = /^(10|15|16|17|20)[0-9]{9}$/;

    if (!regexp.test(number)) {
      return false;
    }

    /**
     * obtenemos el dígito de verificación del número de ruc (último dígito)
     */
    const checkDigit = Number.parseInt(number.substring(10, 11));

    /**
     * obtenemos los primeros 10 dígitos del número de ruc
     */
    const firstTenDigits = Array.from(number.substring(0, 10)).map((digit) => {
      return Number.parseInt(digit);
    });

    /**
     * calculamos la suma de verificación
     */
    const checksum = this._checksum(firstTenDigits);

    /**
     * validamos que el digito de verificación del número de ruc
     * sea igual al resultado de la suma de verificación realizada
     */
    return checkDigit === checksum;
  }

  toString() {
    return this.number;
  }
}
