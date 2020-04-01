const CheckRuc = require('check-ruc');

class Taxpayer {
  constructor(ruc, username, password) {
    this.ruc = ruc;
    this.username = username;
    this.password = password;
  }

  isRucOk() {
    if (CheckRuc.isOk(this.ruc)) {
      return true;
    }

    return false;
  }
}

module.exports = Taxpayer;
