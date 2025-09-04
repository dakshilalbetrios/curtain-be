const { UNAUTHORIZED } = require("../constants/error-messages.constant");
const { UserService } = require("../../services");
const configs = require("../../configs");
const jwt = require("jsonwebtoken");
const { USER_STATUSES } = require("../constants/common");

/**
 * API Authentication Middleware
 * Verifies JWT token from cookie and attaches authenticated user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const authMiddleware = async (req, res, next) => {
  const [code, message] = UNAUTHORIZED.split("::");
  const apiErrorResponse = {
    error: true,
    message: message || "Authentication failed",
    timestamp: new Date().toISOString(),
  };

  try {
    // Extract token from signed cookie
    const token = req.signedCookies.token;
    if (!token) {
      return res.status(401).json(apiErrorResponse);
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, configs.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        ...apiErrorResponse,
        message: "Invalid or expired token",
      });
    }

    // Validate token payload
    if (!decoded?.id || !decoded?.iat || !decoded?.exp) {
      return res.status(401).json({
        ...apiErrorResponse,
        message: "Invalid token: Missing required claims",
      });
    }

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({
        ...apiErrorResponse,
        message: "Token has expired",
      });
    }

    // Fetch user from database
    const user = await new UserService(req.context).getOneUserById({
      userId: decoded.id,
    });

    if (!user) {
      return res.status(401).json({
        ...apiErrorResponse,
        message: "User not found",
      });
    }

    if (user.status !== USER_STATUSES.ACTIVE) {
      return res.status(401).json({
        ...apiErrorResponse,
        message: "User account is not active",
      });
    }

    // Attach context to request
    req.context = {
      user,
      schema: user.organization_id,
    };

    // Add security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );

    return next();
  } catch (error) {
    return res.status(+code).json(apiErrorResponse);
  }
};

module.exports = authMiddleware;
