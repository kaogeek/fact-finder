const functions = require("firebase-functions");
const TwitterApi = require("./TwitterApi");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const admin = require("firebase-admin");
admin.initializeApp();

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
const saveTweetToDb = async (tweetMention, tweet) => {
  // TODO Save Media files
  // TODO Add necessary data
  // TODO Correct date timestamp
  
  const coordinates = {
    "exif": [],
    "reporter": [],
    "source": []
  };

  const timestamp = {
    exif: "",
    reporter: "",
    source: new Date(tweet.created_at)
  };

  let tags = [];
  let hashtags = [];
  if (tweet.entities.hashtags){
    hashtags.push.apply(hashtags, tweet.entities.hashtags)
  }
  if (tweetMention.entities.hashtags){
    hashtags.push.apply(hashtags, tweetMention.entities.hashtags)
  }

  hashtags.forEach((x, i) => {
    const tag = `#${x.tag}`
    if (!tags.includes(tag) && x.tag){
      tags.push(tag)
    }
  });

  let mentions = [];
  if (tweet.entities.mentions){
    mentions.push.apply(mentions, tweet.entities.mentions)
  }
  if (tweetMention.entities.mentions){
    mentions.push.apply(mentions, tweetMention.entities.mentions)
  }
  
  mentions.forEach((x, i) => {
    const tag = `#${x.tag}`
    if (!tags.includes(tag) && x.tag){
      tags.push(tag)
    }
  });

  let mediaUrl = "";
  let mediaType = "";

  if (tweet.entities.urls){
    for (const x of tweet.entities.urls) {
      if (x.display_url.split(".")[0] === "pic"){
        mediaUrl = x.display_url;
        const medType = x.expanded_url.split("/")[6];
        mediaType = (medType === "video" ? "VIDEO" :
                    medType === "photo" ? "IMAGE" : "");
        break;
      }
    }
  };


  const recordData = {
    coordinates: coordinates,
    referenceType: "TWIITER",
    referneceUrl: `https://twitter.com/user/status/${tweet.id}`,
    timestamp: timestamp,
    tags: tags,
    mediaUrl: mediaUrl,
    mediaType: mediaType
  };

  const writeResult = await admin
    .firestore()
    .collection("records")
    .add(recordData);
  return writeResult;
};

/**
 * Set Last Update Tweet Id to Firestore Twitter Bot Configuration
 * for continue query tweet later
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
function setLastUpdate(newest_id) {
  const lastUpdateTweetId = admin
    .firestore()
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE_TWEET_ID");
  lastUpdateTweetId.set({ id: newest_id });
}

// In production, uncomment this to let schedule run.
// exports.scoutTwitter = functions.pubsub.schedule("0 7 * * *").onRun((context) => {
exports.scoutTwitter = functions
  .region("asia-southeast1")
  .https.onRequest(async (request, response) => {
    const lastUpdateTweetId = await admin
      .firestore()
      .collection("twitterBotConfig")
      .doc("LAST_UPDATE_TWEET_ID")
      .get();
    const resp = await TwitterApi.getMentionedTweet(lastUpdateTweetId);
    setLastUpdate(resp.newest_id);
    const tweets = resp.data;
    tweets.map(async (item) => {
      const recordTweet = await TwitterApi.getRecordTweetDetails(item);
      if (recordTweet && shouldSaveTweet(recordTweet)) {
        await saveTweetToDb(item, recordTweet);
      }
    });

    const afterUpdateTweetId = await admin
      .firestore()
      .collection("twitterBotConfig")
      .doc("LAST_UPDATE_TWEET_ID")
      .get();
    response.send(
      `Last Update Tweet Id: ${
        afterUpdateTweetId.data() && afterUpdateTweetId.data().id
      }, ${tweets.length} tweets uploaded`
    );
  });
