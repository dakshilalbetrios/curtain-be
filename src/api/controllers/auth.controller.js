const { AuthService, UserService } = require("../../services");
const configs = require("../../configs");
const {
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  UPDATE_PROFILE_SUCCESS,
} = require("../constants/success-messages.constant");

class AuthController {
  constructor(context) {
    this.userService = new UserService(context);
  }

  async login(req, res, next) {
    try {
      const authService = new AuthService(req.context);
      const { mobile_no, password } = req.body;

      if (!mobile_no || !password) {
        return res.json({
          error: true,
          message: "400::Email and password are required",
          data: null,
        });
      }

      const { user } = await authService.login({ mobile_no, password });
      const token = authService.generateToken(user);

      // Debug logging
      console.log("Token generated:", !!token);
      console.log("User:", user ? user.id : "no user");

      // Set HTTP-only cookie with enhanced security
      const cookieOptions = {
        httpOnly: configs.SECURITY.COOKIE.HTTP_ONLY,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use lax in development
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: configs.SECURITY.COOKIE.PATH,
        domain:
          process.env.NODE_ENV === "production"
            ? configs.COOKIE_DOMAIN
            : undefined,
        signed: true,
      };

      console.log("Cookie options:", cookieOptions);

      // Set the JWT token in HTTP-only cookie
      if (token) {
        res.cookie("token", token, cookieOptions);
        console.log("Cookie set successfully");

        // Debug: Check if cookie was actually set
        console.log("Response headers after setting cookie:", res.getHeaders());
      } else {
        console.error("Token is undefined, cannot set cookie");
      }

      // Send response without using the response middleware for debugging
      return res.json({
        error: false,
        data: {
          user,
        },
        message: LOGIN_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req, res, next) {
    try {
      // Clear the token cookie
      const cookieOptions = {
        httpOnly: configs.SECURITY.COOKIE.HTTP_ONLY,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use lax in development
        path: configs.SECURITY.COOKIE.PATH,
        domain:
          process.env.NODE_ENV === "production"
            ? configs.COOKIE_DOMAIN
            : undefined,
      };

      res.clearCookie("token", cookieOptions);

      res.json({
        data: null,
        message: LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      // The user is already attached to req.context by the auth middleware
      const user = req.context.user;

      res.json({
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const authService = new AuthService(req.context);
      const userData = req.body;

      const updatedUser = await authService.updateUserProfile({
        data: userData,
      });

      res.json({
        data: {
          user: updatedUser,
        },
        message: UPDATE_PROFILE_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
