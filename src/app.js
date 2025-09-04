const express = require("express");
const app = express();
const http = require("http");

const { PORT } = require("./configs");
const server = http.createServer(app);
const { expressLoader } = require("./loaders");
const logger = require("./utils/logger");

expressLoader(app);

app.use(["/api/status"], async (_req, res) => {
  return res.json({ data: { status: "OK" } });
});

server.listen(PORT, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.info(`

      ########################################
      🛡️ HTTP/S server listening on port: ${PORT} 🛡️ 
      ########################################
    `);
});
