const bcrypt = require("bcryptjs");
const UserModel = require("../../models/users/user.model");
const errorMessages = require("../../api/constants/error-messages.constant");
const knex = require("../../loaders/knex");

class UserService {
  constructor(context) {
    try {
      this.context = context;
      this.userModel = new UserModel();
    } catch (error) {
      throw error;
    }
  }

  async createUser({ userData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const isExistedUser = await this.userModel.findByMobile(
        userData.mobile_no,
        trx
      );

      if (isExistedUser) throw new Error(errorMessages.ALREADY_EXISTED_USER);

      if (userData.password) {
        // Hash the password before saving
        const plainPassword = userData.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        userData.hashed_password = hashedPassword;
        delete userData.password;
      }

      // Create user in single database
      const createdUser = await this.userModel.createWithoutUsername({
        data: {
          ...userData,
          created_by: this.context?.user?.id || null,
        },
        trx,
      });

      if (isNewTrx) await trx.commit();
      return createdUser;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async createBulkUsers({ usersData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const createdUsers = [];
      const errors = [];

      for (let i = 0; i < usersData.length; i++) {
        try {
          const userData = usersData[i];

          // Check if mobile number already exists
          const existingUser = await this.userModel.findByMobile(
            userData.mobile_no,
            trx
          );

          if (existingUser) {
            errors.push(`Row ${i + 1}: Mobile number already exists`);
            continue;
          }

          // Hash password
          if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            userData.hashed_password = hashedPassword;
            delete userData.password;
          }

          // Prepare user data
          const userToCreate = {
            ...userData,
            created_by: this.context?.user?.id || null,
          };

          // Remove plain password
          delete userToCreate.password;

          // Create user
          const createdUser = await this.userModel.createWithoutUsername({
            data: userToCreate,
            trx,
          });

          createdUsers.push(createdUser);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      if (errors.length > 0 && createdUsers.length === 0) {
        throw new Error(`Bulk creation failed: ${errors.join(", ")}`);
      }

      if (isNewTrx) await trx.commit();
      return {
        createdUsers,
        errors,
        message: `Successfully created ${createdUsers.length} users${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async updateUser({ userId, updateData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Hash password if provided
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.hashed_password = await bcrypt.hash(
          updateData.password,
          salt
        );
        delete updateData.password;
      }

      // Update user in single database
      const updatedUser = await this.userModel.updateWithoutUsername({
        id: userId,
        data: {
          ...updateData,
          updated_by: this.context?.user?.id || null,
        },
        trx,
      });

      if (isNewTrx) await trx.commit();
      return updatedUser;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getOneUser({ where, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const result = await this.userModel.findOne({ where, trx });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getOneUserById({ userId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const result = await this.userModel.findOne({
        where: { id: userId },
        trx,
      });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getAllUsers({ params = {}, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const result = await this.userModel.findAll({
        params,
        trx,
      });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async findByMobile({ mobileNo, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const result = await this.userModel.findByMobile(mobileNo, trx);

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async exportUsers({ params = {}, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Get all users data with filters and sorting (no pagination)
      const { data } = await this.userModel.findAll({
        params: { ...params, limit: undefined, page: undefined }, // Remove pagination for export
        trx,
      });

      // Call common CSV service
      const CsvService = require("../common/csv.service");
      const csvService = new CsvService();

      const csvData = csvService.generateCsv({
        type: "users",
        data: data,
        queryParams: params,
      });

      if (isNewTrx) await trx.commit();
      return csvData;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async deleteUser({ userId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const isExistedUser = await this.userModel.findOne({
        where: { id: userId },
        trx,
      });

      if (!isExistedUser) throw new Error(errorMessages.USER_NOT_FOUND);

      // Delete user from database
      const result = await this.userModel.delete({
        id: userId,
        trx,
      });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async isUserExists({ mobileNo, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const result = await this.userModel.findByMobile(mobileNo, trx);

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async setUserPassword({ mobileNo, password, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const isExistedUser = await this.userModel.findByMobile(mobileNo, trx);

      if (!isExistedUser) throw new Error(errorMessages.USER_NOT_FOUND);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await this.userModel.updateWithoutUsername({
        id: isExistedUser.id,
        data: { hashed_password: hashedPassword },
        trx,
      });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async changeUserPassword({ old_password, new_password, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }
      const { id } = this.context.user;
      const isExistedUser = await this.getOneUser({ where: { id: id }, trx });

      if (!isExistedUser) throw new Error(errorMessages.USER_NOT_FOUND);

      const isMatch = await bcrypt.compare(
        old_password,
        isExistedUser.hashed_password
      );

      if (!isMatch) throw new Error(errorMessages.INVALID_PASSWORD);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);

      const result = await this.userModel.updateWithoutUsername({
        id: isExistedUser.id,
        data: { hashed_password: hashedPassword },
        trx,
      });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }
}

module.exports = UserService;
