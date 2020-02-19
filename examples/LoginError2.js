const chromium = require('chrome-aws-lambda');

const Signin = require('../lib');

(async() => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
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