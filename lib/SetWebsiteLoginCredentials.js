"use strict";

const Time = require('./Time');
const { LoginSOLError } = require('./errors');

class SetWebsiteLoginCredentials {
  constructor(page) {
    this.page = page;
  }

  async setup(taxpayer) {
    if (!taxpayer.isRucOk()) {
      throw new LoginSOLError(`El número de RUC ingresado es incorrecto: ${taxpayer.ruc}`, {
        reprocess: false
      });
    }

    try {
      const identityTxt = await this.page.waitForSelector(this.getIdentitySelector(), {
        timeout: Time.getSeconds(5),
        visible: true,
      });

      const usernameTxt = await this.page.waitForSelector(this.getUsernameSelector(), {
        timeout: Time.getSeconds(5),
        visible: true,
      });

      const passwordTxt = await this.page.waitForSelector(this.getPasswordSelector(), {
        timeout: Time.getSeconds(5),
        visible: true,
      });

      await identityTxt.type(taxpayer.ruc);

      await usernameTxt.type(taxpayer.username);

      await passwordTxt.type(taxpayer.password);
    } catch ({message}) {
      throw new Error(`Los controles de autenticación no están disponibles: ${message}`);
    }
  }
  /**
   * Selector input ruc
   * @returns {string}
   */
  getIdentitySelector() {
    return 'input#txtRuc';
  }
  /**
   * Selector input usuario sol
   * @returns {string}
   */
  getUsernameSelector() {
    return 'input#txtUsuario';
  }
  /**
   * Selector input clave sol
   * @returns {string}
   */
  getPasswordSelector() {
    return 'input#txtContrasena';
  }
}

module.exports = (page) => {
  const website = new SetWebsiteLoginCredentials(page);

  return async (taxpayer) => {
    await website.setup(taxpayer);
  };
};
