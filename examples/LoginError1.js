const puppeteer = require('puppeteer');

const Signin = require('../lib');

const { strategies } = Signin;

(async() => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm', {
    timeout: 30 * 1000,
    waitUntil: 'domcontentloaded',
  });

  const login = await new Signin(page);

  login.setStrategy(new strategies.TwoCaptcha('239c066cd54b6d090915b616983c4876'));

  await login.signin('10729592673', 'MODDATOS', 'MODDATOS');
})()