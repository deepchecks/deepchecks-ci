const {
  createLambdaFunction,
  createProbot,
} = require("@probot/adapter-aws-lambda-serverless");
const appFn = require("./index.js");

module.exports.webhooks = createLambdaFunction(appFn, {
  probot: createProbot(overrides={privateKey: Buffer.from(process.env.GITHUB_PRIVATE_KEY, 'base64')}),
});