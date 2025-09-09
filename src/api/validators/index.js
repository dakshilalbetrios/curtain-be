/**
 * Centralized export of all validator files
 */
const userValidators = require("./user.validator");
const collectionValidators = require("./collection.validator");
const customerCollectionAccessValidators = require("./customer-collection-access.validator");
const orderValidators = require("./order.validator");
const reportValidators = require("./report.validator");

module.exports = {
  ...userValidators,
  ...collectionValidators,
  ...customerCollectionAccessValidators,
  ...orderValidators,
  ...reportValidators,
};
