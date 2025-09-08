const dotenv = require("dotenv");
require("../api/constants/common");

const envFound = dotenv.config();
if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "your-secret-key", // Should be overridden in production

  // Security Configurations
  SECURITY: {
    PASSWORD: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SPECIAL_CHARS: true,
      MAX_ATTEMPTS: 5,
      LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    },
    SESSION: {
      TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 1 day
      MAX_CONCURRENT_SESSIONS: 3,
    },
    CSRF: {
      TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 1 day
    },
    COOKIE: {
      SECURE: process.env.NODE_ENV === "production",
      SAME_SITE: process.env.NODE_ENV === "production" ? "strict" : "lax",
      HTTP_ONLY: true,
      PATH: "/",
    },
  },

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "",

  SENDER_EMAIL: process.env.CONTACT_US_ADMIN_EMAIL_ID || "support@clinovia.com",
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_TEMPLATE_IDs: {
    VERIFY_EMAIL: "d-1aebb63b050c4c838beb8096aeaa3eca",
    LOGIN_LOCKOUT: "d-0f01745691fd4f8c946265e991bafd35",
    FORGOT_PASSWORD: "d-af2671a0621f440db3a3f583fbe72fef",
  },

  /**
   * databse configrution
   */

  DB_CONFIG: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    timezone: "Z", // This sets MySQL connection to UTC
  },

  // Single database name - no more multi-tenant schemas
  DB_NAME: process.env.DB_NAME || "curtain_db",

  /**
   * Your secret sauce
   */
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  /**
   * API configs
   */
  API_PREFIX: {
    V1: "/api/v1",
  },

  RATE_LIMIT: {
    AUTHENTICATED: {
      MAX: 1000, // limit each authenticated user to 1000 requests per windowMs
      WINDOWMS: 15 * 60 * 1000, // 15 minutes
    },
    UNAUTHENTICATED: {
      MAX: 100, // limit each IP to 100 requests per windowMs
      WINDOWMS: 15 * 60 * 1000, // 15 minutes
    },
    LOGIN: {
      MAX: 5, // limit login attempts
      WINDOWMS: 15 * 60 * 1000, // 15 minutes
    },
    MESSAGE:
      "Too many requests made from this IP, please try again after 15 minutes",
    DELAY: 0, // disable delaying - full speed until the max limit is reached
  },

  // AWS S3 Configuration
  AWS: {
    S3: {
      BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || "clinovia-images",
      BUCKET_URL:
        process.env.AWS_S3_BUCKET_URL ||
        "https://clinovia-images.s3.amazonaws.com",
      REGION: process.env.AWS_REGION || "us-east-1",
      ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
      ACL: process.env.AWS_S3_ACL || "private",
    },
  },

  // Interakt Configuration
  INTERAKT_API_KEY: process.env.INTERAKT_API_KEY,
  INTERAKT_API_URL: process.env.INTERAKT_API_URL,

  // Order Configuration
  ORDER_DELIVERED_DAY: parseInt(process.env.ORDER_DELIVERED_DAY) || 4,
};
