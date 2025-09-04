const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserService = require("../users/user.service");
const errorMessages = require("../../api/constants/error-messages.constant");
const configs = require("../../configs");
const crypto = require("crypto");
const { USER_STATUSES } = require("../../api/constants/common");

class AuthService {
  constructor(context) {
    try {
      this.context = context;
      this.userService = new UserService("core");
    } catch (error) {
      throw error;
    }
  }

  async login({ mobile_no, password, trx }) {
    try {
      // Use the direct model method to avoid field mapping issues
      const user = await this.userService.findByMobile({
        mobileNo: mobile_no,
        trx,
      });

      console.log("user", user);

      if (!user) {
        throw new Error(errorMessages.USER_NOT_FOUND);
      }

      // Check user status before proceeding
      if (user.status === USER_STATUSES.RESIGNED) {
        throw new Error(errorMessages.USER_RESIGNED);
      }

      if (user.status === USER_STATUSES.INACTIVE) {
        throw new Error(errorMessages.USER_INACTIVE);
      }

      const isMatch = await bcrypt.compare(password, user.hashed_password);

      console.log("isMatch", isMatch);

      if (!isMatch) {
        throw new Error(errorMessages.INVALID_PASSWORD);
      }

      return { user };
    } catch (error) {
      throw error;
    }
  }

  generateToken(user) {
    try {
      if (!configs.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
      }

      const sessionId = crypto.randomBytes(32).toString("hex");
      const payload = {
        id: user.id,
        mobile_no: user.mobile_no,
        role: user.role,
        sessionId,
        iat: Math.floor(Date.now() / 1000),
      };

      const token = jwt.sign(payload, configs.JWT_SECRET, {
        expiresIn: configs.SECURITY.SESSION.TOKEN_EXPIRY / 1000, // Convert to seconds
      });

      return token;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile({ data }) {
    try {
      const { id, ...userData } = data;

      const userServices = new UserService(this.context);
      const updatedUser = await userServices.updateUser({
        userId: id,
        updateData: userData,
      });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
