const functions = require("firebase-functions");
const TwitterApi = require("./TwitterApi")

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Logic to decide whether to save tweet or not.
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
function shouldSaveTweet(tweet) {
  const publicMetrics = tweet.public_metrics;
  const haveAttachments = !!tweet.attachments;
  const highEngagement = publicMetrics.retweet_count > 1000 || publicMetrics.reply_count > 10 || publicMetrics.like_count > 500 || publicMetrics.quote_count > 20;
  if (haveAttachments && highEngagement) {
    return tweetNotExistedInDb(tweet);
  }
}

/**
 * Check whether current tweet already have in db yet?
 * @param {*} tweet 
 */
function tweetNotExistedInDb(tweet) {
  return true; // TODO search firestore by tweet id.
}

/**
 * Save record tweet to database
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
async function saveTweetToDb(tweet) {
  // TODO Save Media files
  // TODO Add necessary data
  // TODO Correct date timestamp
  const recordData = {
    referenceType: "TWIITER",
    referneceUrl: `https://twitter.com/user/status/${tweet.id}`,
    timestamp: new Date(tweet.created_at),
  }
  const writeResult = await admin.firestore().collection('records').add(recordData);
  return writeResult;
}

/**
 * Set Last Update Tweet Id to Firestore Twitter Bot Configuration
 * for continue query tweet later
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
 function setLastUpdate(tweet) {
  const lastUpdateTweetId = admin.firestore().collection('twitterBotConfig').doc("LAST_UPDATE_TWEET_ID");
  lastUpdateTweetId.set({ id: tweet.id });
}

// In production, uncomment this to let schedule run.
// exports.scoutTwitter = functions.pubsub.schedule("0 7 * * *").onRun((context) => {
exports.scoutTwitter = functions
  .region("asia-southeast1")
  .https.onRequest(async (request, response) => {
    const lastUpdateTweetId = await admin.firestore().collection('twitterBotConfig').doc("LAST_UPDATE_TWEET_ID").get();
    const tweets = await TwitterApi.getMentionedTweet(lastUpdateTweetId)
    tweets.map(async (item) => {
      recordTweet = await TwitterApi.getRecordTweetDetails(item)
      if (recordTweet && shouldSaveTweet(recordTweet)) {
        await saveTweetToDb(recordTweet)
      }
      setLastUpdate(item)
    })

    const afterUpdateTweetId = await admin.firestore().collection('twitterBotConfig').doc("LAST_UPDATE_TWEET_ID").get();
    response.send(`Last Update Tweet Id: ${afterUpdateTweetId.data() && afterUpdateTweetId.data().id}`);
});
