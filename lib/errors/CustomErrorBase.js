"use strict";

class CustomErrorBase extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    Error.captureStackTrace(this, CustomErrorBase);
  }
}

export { CustomErrorBase };
