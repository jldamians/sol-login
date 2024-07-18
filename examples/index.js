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
    const ruc = '10460033280';
    const user = 'MODDATOS';
    const pass = 'MODDATOS';

    // ************************************************************
      // Connect to Chrome DevTools
      /*const client = await page.target().createCDPSession()

      // Set throttling property
      await client.send('Network.emulateNetworkConditions', {
        'offline': false,
        'downloadThroughput': 200 * 1024 / 8,
        'uploadThroughput': 200 * 1024 / 8,
        'latency': 20
      })*/
    // ************************************************************

    await page.goto(SUNAT_WEBSITE_URL, {
      timeout: MAXIMUM_WAIT_TIME,
      waitUntil: 'networkidle0',
    });

    await page.setRequestInterception(REQUEST_INTERCEPTION);

    /*page.on("response", async response => {
      const link = response.url();

      if (link.search('https://api-seguridad.sunat.gob.pe/v1') !== -1) {
        //const content = await response.text();
        const status = response.status();

        console.log('* * * * * * * * * * * * * * *');
        console.log(link);
        //console.log(content);
        console.log(status);
        console.log('* * * * * * * * * * * * * * *');
      }
    });*/

    await SunatLoginHandler(page, {
      visible: true,
      click: true,
      interception: REQUEST_INTERCEPTION,
    }).login(ruc, user, pass);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
    console.timeEnd('scraper');
  }
})()
