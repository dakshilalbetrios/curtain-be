const bodyParser = require("body-parser");
const compression = require("compression");
const config = require("../configs");
const { responseMiddleware, errorMiddleware } = require("../api/middlewares");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const logger = require("../utils/logger");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { router } = require("../api/routes");
const configs = require("../configs");

// Custom input sanitization middleware
const sanitizeInput = (req, _res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        // Remove any potential SQL injection patterns
        req.body[key] = req.body[key].replace(
          /[\0\x08\x09\x1a\n\r"'\\\%]/g,
          (char) => {
            switch (char) {
              case "\0":
                return "\\0";
              case "\x08":
                return "\\b";
              case "\x09":
                return "\\t";
              case "\x1a":
                return "\\z";
              case "\n":
                return "\\n";
              case "\r":
                return "\\r";
              case '"':
              case "'":
              case "\\":
              case "%":
                return "\\" + char;
              default:
                return char;
            }
          }
        );
      }
    });
  }
  next();
};

// Prevent parameter pollution
const preventParameterPollution = (req, _res, next) => {
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    });
  }
  next();
};

module.exports = async (app) => {
  try {
    // Security Middleware
    app.use(helmet());
    app.use(helmet.noSniff());
    app.use(helmet.hidePoweredBy());
    app.use(
      helmet.hsts({
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      })
    );

    // Set security headers
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      })
    );

    // Enable XSS protection
    app.use(helmet.xssFilter());

    // Compression
    app.use(compression());

    // Cookie Parser with secret
    app.use(cookieParser(configs.COOKIE_SECRET));

    // Body Parser with size limits
    app.use(
      bodyParser.json({
        limit: "5mb",
        verify: (req, _res, buf) => {
          req.rawBody = buf;
        },
      })
    );
    app.use(
      bodyParser.urlencoded({
        limit: "5mb",
        extended: true,
        parameterLimit: 50000,
      })
    );

    // Input sanitization and parameter pollution prevention
    app.use(sanitizeInput);
    app.use(preventParameterPollution);

    // Trust Proxy
    app.enable("trust proxy");

    // CORS Configuration
    const allowedOrigins = [configs.FRONTEND_URL];
    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.push(
        "http://localhost:3000",
        "http://localhost:3001",
        "http://192.168.1.9:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://192.168.1.9:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://localhost:5174"
      );
    }

    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            // logger.debug("CORS allowed for origin", { origin });
            return callback(null, true);
          } else {
            logger.warn("CORS blocked for origin", { origin });
            return callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "X-Device-ID",
        ],
        exposedHeaders: ["Set-Cookie"],
        maxAge: 86400, // 24 hours
        preflightContinue: false,
        optionsSuccessStatus: 204,
      })
    );

    // Add additional headers for cookie domain
    app.use((_req, res, next) => {
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Origin", configs.FRONTEND_URL);
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With, X-Device-ID"
      );
      next();
    });

    // Response Format
    app.use(responseMiddleware);

    // Rate Limiting
    const createRateLimiter = (options) => {
      return rateLimit({
        ...options,
        validate: { trustProxy: true },
        keyGenerator: (req) => {
          // For authenticated requests, use user ID + IP
          if (req.signedCookies.token) {
            const ip =
              req.headers["x-forwarded-for"] ??
              req.socket.remoteAddress ??
              req.ip;
            return `${req.signedCookies.token}-${ip}`;
          }
          // For unauthenticated requests, use IP + device ID
          const deviceId = req.headers["x-device-id"] ?? "unknown";
          const ip =
            req.headers["x-forwarded-for"] ??
            req.socket.remoteAddress ??
            req.ip;
          return `${ip}-${deviceId}`;
        },
        handler: (_req, res) => {
          res.status(429).json({
            error: true,
            message: config.RATE_LIMIT.MESSAGE,
            data: null,
          });
        },
        skip: (req) => {
          // Skip rate limiting for health check endpoints
          return req.path === "/health" || req.path === "/metrics";
        },
      });
    };

    // Apply different rate limits based on route
    const authLimiter = createRateLimiter({
      max: config.RATE_LIMIT.LOGIN.MAX,
      windowMs: config.RATE_LIMIT.LOGIN.WINDOWMS,
    });

    const authenticatedLimiter = createRateLimiter({
      max: config.RATE_LIMIT.AUTHENTICATED.MAX,
      windowMs: config.RATE_LIMIT.AUTHENTICATED.WINDOWMS,
    });

    const unauthenticatedLimiter = createRateLimiter({
      max: config.RATE_LIMIT.UNAUTHENTICATED.MAX,
      windowMs: config.RATE_LIMIT.UNAUTHENTICATED.WINDOWMS,
    });

    // Apply rate limiters to routes
    app.use(`${config.API_PREFIX.V1}/auth/login`, authLimiter);
    app.use(`${config.API_PREFIX.V1}/auth/register`, authLimiter);

    // Apply authenticated limiter to protected routes
    app.use((req, res, next) => {
      if (req.signedCookies.token) {
        authenticatedLimiter(req, res, next);
      } else {
        unauthenticatedLimiter(req, res, next);
      }
    });

    // Routes
    app.use(config.API_PREFIX.V1, router);

    // Error Handling
    app.use(errorMiddleware);

    // 404 Handler
    app.use((_req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });
  } catch (error) {
    logger.error("Error in express loader:", error);
    process.exit(1);
  }
};
