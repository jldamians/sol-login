"use strict";

import puppeteer from "puppeteer";

import WebsiteSOL from "../lib/index.js";

(async() => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  try {
    page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm', {
      timeout: 30 * 1000,
      waitUntil: 'domcontentloaded',
    });

    const perfil = await WebsiteSOL(page).login('10460033280', 'MODDATOS', 'MODDATOS');

    console.log(perfil);
  } catch (error) {
    await browser.close();

    console.log(error);
  }
})()
