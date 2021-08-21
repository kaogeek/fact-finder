const functions = require("firebase-functions");
const { handlerFunc } = require("./handler");

// In production, uncomment this to let schedule run.
// exports.scoutTwitter = functions.pubsub.schedule("0 7 * * *").onRun((context) => {
exports.scoutTwitter = functions
  .region("asia-southeast1")
  .https.onRequest(handlerFunc);
