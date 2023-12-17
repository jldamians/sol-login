"use strict";

import puppeteer from "puppeteer";

import SunatLoginHandler, {TimeConverterUtil} from "../lib/index.js";

(async() => {
  console.time('scraper');
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    slowMo: 5,
    defaultViewport: {
      width: 1280,
      height: 720,
		},
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
			'--start-maximized',
			// These arguments (args) help me consistently locate iframes
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });

  const [ page ] = await browser.pages();

  try {
    const SUNAT_WEBSITE_URL = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';
    const MAXIMUM_WAIT_TIME = TimeConverterUtil(20).secsToMillis();
    const REQUEST_INTERCEPTION = true;
    const ruc = '10460033281';
    const user = 'MODDATOS';
    const pass = 'MODDATOS';

    await page.goto(SUNAT_WEBSITE_URL, {
      timeout: MAXIMUM_WAIT_TIME,
      waitUntil: 'networkidle0',
    });

    await page.setRequestInterception(REQUEST_INTERCEPTION);

    const perfil = await SunatLoginHandler(page, {
      visible: true,
      click: true,
      interception: REQUEST_INTERCEPTION,
    }).login(ruc, user, pass);

    console.log(perfil);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
    console.timeEnd('scraper');
  }
})()
