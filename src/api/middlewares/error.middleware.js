/**
 * API error handler
 */

const {
  INTERNAL_SERVER_ERROR,
  SOMETHING_WENT_WRONG,
} = require("../constants/error-messages.constant");
const logger = require("../../utils/logger");

const errorMiddleware = (error, _req, res, _next) => {
  let [code, message] = INTERNAL_SERVER_ERROR.split("::");

  const { message: errorMessage, stack: errorStack } = error;

  if (errorMessage) {
    if (errorMessage.includes("::")) {
      code = errorMessage.split("::")[0];
      message = errorMessage.split("::")[1];
    } else {
      code =
        errorMessage === "Request failed with status code 401" ? 401 : code;
      message =
        errorMessage === "Request failed with status code 401"
          ? SOMETHING_WENT_WRONG.split("::")[1]
          : errorMessage;
    }

    if (+code !== 200) {
      logger.error(errorStack);
    }
  }

  const apiErrorResponse = {
    error: true,
    message: message || "",
    data: null,
  };

  res.status(+code).json(apiErrorResponse);
};

module.exports = errorMiddleware;
