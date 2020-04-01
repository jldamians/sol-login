const Time = require('./Time');

class SelectLoginType {
  constructor(page) {
    this.page = page;
  }

  async select() {
    // Seleccionar el tipo de ingreso al portal SOL
    const selector = this.getLoginTypeSelector();

    try {
      const loginBtn = await this.page.waitForSelector(selector, {
        timeout: Time.getSeconds(10),
        visible: true,
      });

      await loginBtn.click();
    } catch ({ message }) {
      throw new Error(`El tipo de inicio de sesión no está disponible: ${message}`);
    }
  }

  /**
   * Devuelve el selector del botón de ingreso por ruc
   */
  getLoginTypeSelector() {
    return 'button#btnPorRuc';
  }
}

module.exports = async (page) => {
  const login = new SelectLoginType(page);

  await login.select();
};
