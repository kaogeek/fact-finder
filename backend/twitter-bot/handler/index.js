const TwitterApi = require("../twitter/client");
const { db } = require("../db/firestore");

/**
 * Logic to decide whether to save tweet or not.
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
 function shouldSaveTweet(tweet) {
  const publicMetrics = tweet.public_metrics;
  const haveAttachments = !!tweet.attachments;
  const highEngagement =
    publicMetrics.retweet_count > 1000 ||
    publicMetrics.reply_count > 10 ||
    publicMetrics.like_count > 500 ||
    publicMetrics.quote_count > 20;
  if (haveAttachments && highEngagement) {
    return tweetNotExistedInDb(tweet);
  }
}

/**
 * Check whether current tweet already have in db yet?
 * @param {*} tweet
 */
// eslint-disable-next-line no-unused-vars
function tweetNotExistedInDb(tweet) {
  return true; // TODO search firestore by tweet id.
}

/**
 * Save record tweet to database
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
const saveTweetToDb = async (tweet) => {
  // TODO Save Media files
  // TODO Add necessary data
  // TODO Correct date timestamp
  const recordData = {
    referenceType: "TWIITER",
    referneceUrl: `https://twitter.com/user/status/${tweet.id}`,
    timestamp: new Date(tweet.created_at),
  };
  const writeResult = await db
    .collection("records")
    .add(recordData);
  return writeResult;
};

/**
 * Set Last Update Tweet Id to Firestore Twitter Bot Configuration
 * for continue query tweet later
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
function setLastUpdate(tweet) {
  const lastUpdateTweetId = db
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE_TWEET_ID");
  lastUpdateTweetId.set({ id: tweet.id });
}

exports.handlerFunc = async function (_, res) {
  const lastUpdateTweetId = await db
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE_TWEET_ID")
    .get();
  const tweets = await TwitterApi.getMentionedTweet(lastUpdateTweetId);
  tweets.map(async (item) => {
    const recordTweet = await TwitterApi.getRecordTweetDetails(item);
    if (recordTweet && shouldSaveTweet(recordTweet)) {
      await saveTweetToDb(recordTweet);
    }
    setLastUpdate(item);
  });

  const afterUpdateTweetId = await db
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE_TWEET_ID")
    .get();
  res.send(
    `Last Update Tweet Id: ${
      afterUpdateTweetId.data() && afterUpdateTweetId.data().id
    }`
  );
};
