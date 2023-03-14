const { createNodeMiddleware, Probot } = require("probot");
const app = require("./index.js");

const probot = new Probot({
  appId: process.env.APP_ID,
  privateKey: Buffer.from(process.env.GITHUB_PRIVATE_KEY, 'base64'),
  secret: process.env.WEBHOOK_SECRET,
  logLevel: process.env.LOG_LEVEL
});

module.exports = createNodeMiddleware(app, { probot });