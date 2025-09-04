const knex = require("../loaders/knex");

class TransactionManager {
  static async execute(operation) {
    const trx = await knex.transaction();
    try {
      const result = await operation(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = TransactionManager;
