/**
 * Errores que lanza la página de SUNAT,
 * como resultado de validaciones de formato
 */

const url = require('url');

const Time = require('./Time');
const { LoginSOLError } = require('./errors');

class ExternalAuthenticationFailures {
  constructor(page) {
    this.page = page;
  }

  async throw() {
    const element = await this.page.waitForSelector(this.getErrorMessageSelector(), {
      timeout: Time.getSeconds(15),
      visible: true,
    });

    const message = await (await element.getProperty('innerText')).jsonValue();

    const screenshot = await (
      await this.page.$(this.getLoginSectionSelector())
    ).screenshot({ encoding: 'base64' });

    throw new LoginSOLError(message.trim(), { screenshot, reprocess: false });
  }

  getErrorMessageSelector() {
    return 'span#spanMensajeError';
  }

  getLoginSectionSelector() {
    return 'div.panel.panel-primary';
  }

  static getPathname() {
    return '/cl-ti-itmenu/MenuInternet.htm';
  }
}

exports = module.exports = async (page) => {
  const failure = new ExternalAuthenticationFailures(page);

  await failure.throw();
};

exports.its = (websiteUrl) => {
  const parse = url.parse(websiteUrl);
  const pathnameToCheck = ExternalAuthenticationFailures.getPathname();

  return parse.pathname === pathnameToCheck && parse.query === null;
};
