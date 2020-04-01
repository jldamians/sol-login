const Time = require('./Time');

class WaitForPageLoad {
  constructor(page) {
    this.page = page;
  }

  async wait() {
    try {
      // Esperamos a que la nueva página y todos sus recursos hayan cargado
      await this.page.waitForFunction((state) => {
        return document.readyState === state;
      }, {
        timeout: Time.getSeconds(20),
        polling: 200,
      }, this.getStateComplete());
    } catch ({ message }) {
      throw new Error(`La página no ha cargado: ${message}`);
    }
  }

  getStateComplete() {
    return 'complete';
  }
}

module.exports = async (page) => {
  const complete = new WaitForPageLoad(page);

  await complete.wait();
};
