require("dotenv").config();
const functions = require("firebase-functions");

const NODE_ENV = process.env.NODE_ENV || "development";

exports.NODE_ENV = NODE_ENV;
exports.TWITTER_TOKEN = NODE_ENV === "development" ? process.env.TWITTER_TOKEN : functions.config().twitter.twitter_bearer_token ;
