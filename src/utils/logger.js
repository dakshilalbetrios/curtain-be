const pino = require("pino");

// Create a base logger with default configuration
const baseLogger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname,env,name",
    },
  },
});

// Create a child logger with request tracking
const logger = baseLogger.child({
  name: "clinovia-api",
  env: process.env.NODE_ENV || "development",
});

module.exports = logger;
