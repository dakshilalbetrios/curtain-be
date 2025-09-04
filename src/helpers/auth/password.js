/**
 * Common function
 */
const crypto = require("crypto");

const cryptoPassword = ({ salt, password }) => {
  salt = salt ? salt : `${Math.round(new Date().valueOf() * Math.random())}`;

  const hashedPassword = crypto
    .createHmac("sha1", salt)
    .update(password)
    .digest("hex");

  return {
    salt,
    hashedPassword,
  };
};

const validatePassword = ({ password, hashedPassword, salt }) => {
  const { hashedPassword: hashedInputPassword } = cryptoPassword({
    password,
    salt,
  });
  return hashedInputPassword === hashedPassword;
};

const cryptoSecureCode = ({ secureCode, salt }) => {
  salt = salt ? salt : `${Math.round(new Date().valueOf() * Math.random())}`;
  const hashedSecureCode = crypto
    .createHmac("sha1", salt)
    .update(secureCode)
    .digest("hex");
  return { hashedSecureCode, salt };
};

const validateSecureCode = ({ secureCode, hashedSecureCode, salt }) => {
  const { hashedSecureCode: hashedInputSecureCode } = cryptoSecureCode({
    secureCode,
    salt,
  });

  return hashedInputSecureCode === hashedSecureCode;
};

module.exports = {
  cryptoPassword,
  validatePassword,
  cryptoSecureCode,
  validateSecureCode,
};
