/**
 * Error que lanza el servidor de SUNAT,
 * como resultado de validaciones de datos
 */

const url = require('url');

const Time = require('./Time');
const { LoginSOLError } = require('./errors');

class InternalAuthenticationFailures {
  constructor(page) {
    this.page = page;
  }

  async throw() {
    let reprocess;

    const element = await this.page.waitForSelector(this.getErrorMessageSelector(), {
      timeout: Time.getSeconds(15),
      visible: true,
    });

    const message = await (await element.getProperty('innerText')).jsonValue();

    const screenshot = await (
      await this.page.$(this.getLoginSectionSelector())
    ).screenshot({ encoding: 'base64' });

    // cuando se utilice algún servicio para engañar
    // al recaptcha, exite la posibilidad de fallos
    if (message.indexOf('Captcha') !== -1) {
      reprocess = true;
    } else {
      reprocess = false;
    }

    throw new LoginSOLError(message.trim(), { screenshot, reprocess });
  }

  getErrorMessageSelector() {
    return 'div.alert.alert-danger.text-left';
  }

  getLoginSectionSelector() {
    return 'div.panel.panel-primary';
  }

  static getPathname() {
    return '/cl-ti-itmenu/AutenticaMenuInternet.htm';
  }
}

exports = module.exports = async (page) => {
  const failure = new InternalAuthenticationFailures(page);

  await failure.throw();
};

exports.its = (websiteUrl) => {
  const parse = url.parse(websiteUrl);
  const pathnameToCheck = InternalAuthenticationFailures.getPathname();

  return parse.pathname === pathnameToCheck;
};
