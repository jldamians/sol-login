const Time = require('./Time');

class LoginWebsiteSOL {
  constructor(page) {
    this.page = page;
  }

  /**
   * Inicio de sesión
   */
  async login() {
    try {
      const selector = this.getLoginBtnSelector();

      const loginBtn = await this.page.waitForSelector(selector, {
        timeout: Time.getSeconds(10),
        visible: true,
      });

      await loginBtn.click();
    } catch ({ message }) {
      throw new Error(`El botón para iniciar sesión no está disponible: ${message}`);
    }
  }

  getLoginBtnSelector() {
    return 'button#btnAceptar';
  }
}

module.exports = async (page) => {
  const website = new LoginWebsiteSOL(page);

  await website.login();
};
