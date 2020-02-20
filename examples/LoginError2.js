const puppeteer = require('puppeteer');

const Signin = require('../lib');

(async() => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm', {
    timeout: 30 * 1000,
    waitUntil: 'domcontentloaded',
  });

  const login = new Signin(page);

  login.setKey('239c066cd54b6d090915b616983c4876', '2captcha');

  await login.signin('10729592663', 'MODDATOS', 'MODDATOS');
})()