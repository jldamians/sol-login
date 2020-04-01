class SetWebsiteRecaptchaToken {
  constructor(page) {
    this.page = page;
  }

  async setRecaptchaToken(token) {
    let response;

    // validamos si el valor de token es "null"
    // para establecer un valor por defecto
    if (!token) {
      response = this.getCheatToken();
    } else {
      response = token;
    }

    await this.page.evaluate(this.getRecaptchaInstruction(response));
  }

  getRecaptchaInstruction(token) {
    return `document.getElementById("g-recaptcha-response").innerHTML="${token}";`
  }

  getCheatToken() {
    return 'trash';
  }
}

module.exports = (page) => {
  const website = new SetWebsiteRecaptchaToken(page);

  return async (token) => {
    await website.setRecaptchaToken(token);
  };
};
