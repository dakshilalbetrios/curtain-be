const errorMessages = require("../constants/error-messages.constant");
const successMessages = require("../constants/success-messages.constant");
const UserService = require("../../services/users/user.service");
const knex = require("../../loaders/knex");

class UserController {
  constructor() {}

  async createUser(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);
      const userData = req.body;

      const createdUser = await userService.createUser({
        userData,
        trx,
      });

      await trx.commit();
      return res.json({
        data: createdUser,
        message: "201::User created successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async createBulkUsers(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);
      const usersData = req.body;

      // Validate that usersData is an array
      if (!Array.isArray(usersData)) {
        return res.json({
          error: true,
          message: "400::Request body must be an array of users",
        });
      }

      // Validate array length (max 100 users at once)
      if (usersData.length > 400) {
        return res.json({
          error: true,
          message: "400::Maximum 400 users can be created at once",
        });
      }

      if (usersData.length === 0) {
        return res.json({
          error: true,
          message: "400::At least one user must be provided",
        });
      }

      const result = await userService.createBulkUsers({
        usersData,
        trx,
      });

      await trx.commit();

      return res.json({
        data: result,
        message: `201::Successfully created ${result.createdUsers.length} users${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ""}`,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);

      const { data, pagination } = await userService.getAllUsers({
        params: req.query, // Pass all query params directly to base model (including page/limit)
        trx,
      });

      await trx.commit();
      return res.json({
        data,
        pagination,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async exportUsers(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);

      const csvData = await userService.exportUsers({
        params: req.query, // Pass all query params for filtering and sorting
        trx,
      });

      await trx.commit();

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="users-export.csv"'
      );

      return res.send(csvData);
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async getOneUser(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const { id } = req.params;
      const userService = new UserService(req.context);

      const user = await userService.getOneUserById({
        userId: id,
        trx,
      });

      if (!user) {
        await trx.commit();
        return res.json({ error: errorMessages.USER_NOT_FOUND });
      }

      await trx.commit();
      return res.json({
        data: user,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async updateUser(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);
      const { id } = req.params;
      const userData = req.body;

      const updatedUser = await userService.updateUser({
        userId: id,
        updateData: userData,
        trx,
      });

      if (!updatedUser) {
        await trx.commit();
        return res.json({
          error: true,
          message: errorMessages.USER_NOT_FOUND,
        });
      }

      await trx.commit();
      return res.json({
        data: updatedUser,
        message: "200::User updated successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);
      const { id } = req.params;

      const result = await userService.deleteUser({
        userId: id,
        trx,
      });

      if (result === 0) {
        await trx.commit();
        return res.json({
          error: true,
          message: errorMessages.USER_NOT_FOUND,
        });
      }

      await trx.commit();
      return res.json({
        data: { message: successMessages.USER_DELETED_SUCCESS },
        message: "200::User deleted successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async isUserExists(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);
      const { mobileNo } = req.query;

      const result = await userService.isUserExists({
        mobileNo,
        trx,
      });

      await trx.commit();
      return res.json({
        data: result,
        message: result ? "200::User exists" : "200::User does not exist",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async setUserPassword(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);
      const { mobile_no, password } = req.body;

      const result = await userService.setUserPassword({
        mobileNo: mobile_no,
        password,
        trx,
      });

      await trx.commit();
      return res.json({
        data: result,
        message: "200::User password set successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async changeUserPassword(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const userService = new UserService(req.context);
      const { oldPassword, newPassword } = req.body;

      const result = await userService.changeUserPassword({
        old_password: oldPassword,
        new_password: newPassword,
        trx,
      });

      await trx.commit();
      return res.json({
        data: result,
        message: "200::User password changed successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }
}

module.exports = UserController;
