/**
 * Final API response format
 */
const mung = require("express-mung");
const { API_SUCCESS } = require("../constants/success-messages.constant");

const responseMiddleware = (body, _req, res) => {
  let [code, message] = body.message
    ? body.message.split("::")
    : API_SUCCESS.split("::");

  const apiResponse = {
    error: body.error || false,
    message: message || "",
    data: body.data,
    pagination: body.pagination,
  };

  // logger.log(
  //   `${req.method} ${req.path}`,
  //   "\n",
  //   `User Id: ${req.user?.id || "-"}`,
  //   "\n",
  //   `Authorization: ${req.headers.authorization}`,
  //   "\n",
  //   req.body,
  //   "\n",
  //   `${code} :: ${message}`
  // );

  // const pool = knex.client.pool;
  // logger.info(`Connections Stats: ${pool.numPendingCreates()} / ${pool.numUsed()} / ${pool.numFree()}`);

  res.status(+code).json(apiResponse);
};

module.exports = mung.json(responseMiddleware);
