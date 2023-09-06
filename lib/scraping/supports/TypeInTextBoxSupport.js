"use strict";

import { Frame, Page } from "puppeteer";

import TimeConverter from "../../utils/TimeConverter.js";

/**
 * Digitar sobre el elemento HTML
 * @param {Page | Frame} element
 * @param {string} value
 * @param {{ visible: boolean, timeout: number }} options Opciones
 */
export default async function(element, selector, value, options = {}) {
  const input = await element.waitForSelector(selector, {
    visible: options?.visible ?? false,
    timeout: options?.timeout ?? TimeConverter(5).secsToMillis(),
  });

  await input.type(value);
}
