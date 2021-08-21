require("dotenv").config();
const functions = require("firebase-functions");

const NODE_ENV = process.env.NODE_ENV || "development";

exports.NODE_ENV = NODE_ENV;
exports.TWITTER_TOKEN =
  NODE_ENV === "development"
    ? process.env.TWITTER_TOKEN
    : functions.config().twitter.twitter_bearer_token;

exports.TWITER_API_URL =
  process.env.TWITER_API_URL || "https://api.twitter.com/2";

exports.TWITTER_MAX_RESULTS = process.env.TWITTER_MAX_RESULTS || 5;
exports.TWITTER_FIELDS =
  "attachments,author_id,conversation_id,geo,created_at,entities,public_metrics,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld";
