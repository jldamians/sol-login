exports.TWO_CAPTCHA = '2captcha';

exports.TwoCaptcha = require('./TwoCaptcha');

exports.get = (type) => {
  let newClase;

  switch (type) {
    case this.TWO_CAPTCHA:
      newClase = this.TwoCaptcha; 
      break;
  
    default:
      newClase = null;
      break;
  }

  return newClase;
};
