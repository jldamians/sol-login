/*
  Ante un redireccionamiento, tendremos que esperar a que los
  nuevos componenetes de la página sean reflejados en el dom.
*/

/*
  Empleamos este mecanismo debido a que "waitForNavigation",
  siempre espera que haya un redireccionamiento, y en caso
  de no haberlo, lanzará una excepción por "timeout".

  Este método evalua el "readyState" de la página
  ante un redireccionamiento, y en caso de no haberlo,
  se entiende que "readyState" no sufre modificación (será el mismo)
*/

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
