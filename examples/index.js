"use strict";

import puppeteer from "puppeteer";

import SunatLoginHandler, {TimeConverterUtil} from "../lib/index.js";

(async() => {
  console.time('scraper');
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 5,
    defaultViewport: {
      width: 1280,
      height: 720,
		},
    args: [
      //'--no-sandbox',
      //'--disable-setuid-sandbox',
      //'--disable-dev-shm-usage',
      //'--disable-gpu',
			'--start-maximized',
    ],
    devtools: true,
  });

  const [ page ] = await browser.pages();

  try {
    const SUNAT_WEBSITE_URL = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';
    const MAXIMUM_WAIT_TIME = TimeConverterUtil(20).secsToMillis();
    page.goto(SUNAT_WEBSITE_URL, {
      timeout: MAXIMUM_WAIT_TIME,
      waitUntil: 'networkidle0',
    });

    const perfil = await SunatLoginHandler(page, {
      visible: true,
      click: true
    }).login('10460033280', 'MODDATOS', 'MODDATOS');

    console.log(perfil);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
    console.timeEnd('scraper');
  }
})()
