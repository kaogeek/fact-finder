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
 * @param {*} recordData Single Tweet response from Tweet API
 */
const saveTweetToDb = async (recordData) => {
  // TODO Save Media files
  // TODO Correct date timestamp
  const writeResult = await admin
    .firestore()
    .collection("records")
    .add(recordData);
  return writeResult;
};

/**
 * Get a record data from report and record tweet
 * @param {*} reportTweet 
 * @param {*} recordTweet 
 * @returns a record data
 */
function getRecordData(reportTweet, recordTweet){
  // TODO Add necessary data
  const recordTweetData = recordTweet.data;
  let coordinates_source = [];
  if (recordTweet.includes && recordTweet.includes.places){
    coordinates_source = recordTweet.includes.places[0].geo.bbox;
  }
  const coordinates = {
    "exif": [],
    "reporter": [],
    "source": coordinates_source
  };
  const timestamp = {
    exif: "",
    reporter: "",
    source: new Date(recordTweetData.created_at)
  };

  let tags = [];
  let hashtags = [];
  if (recordTweetData.entities.hashtags){
    hashtags.push.apply(hashtags, recordTweetData.entities.hashtags)
  }
  if (reportTweet.entities.hashtags){
    hashtags.push.apply(hashtags, reportTweet.entities.hashtags)
  }

  for (const x of hashtags) {
    const tag = `#${x.tag}`
    if (!tags.includes(tag) && x.tag){
      tags.push(tag)
    }
  }

  let mentions = [];
  if (recordTweetData.entities.mentions){
    mentions.push.apply(mentions, recordTweetData.entities.mentions)
  }
  if (reportTweet.entities.mentions){
    mentions.push.apply(mentions, reportTweet.entities.mentions)
  }
  
  for (const x of mentions) {
    const tag = `#${x.tag}`
    if (!tags.includes(tag) && x.tag){
      tags.push(tag)
    }
  }

  let mediaUrl = "";
  let mediaType = "";
  if (recordTweet.includes && recordTweet.includes.media){
    mediaType = recordTweet.includes.media[0].type.toUpperCase();
    if (mediaType === "PHOTO"){
      mediaType = "IMAGE";
      mediaUrl = recordTweet.includes.media[0].url;
    } else if (mediaType === "VIDEO"){
      mediaUrl = recordTweet.includes.media[0].preview_image_url;
    }
  }

  return {
    coordinates,
    referenceType: "TWIITER",
    referneceUrl: `https://twitter.com/user/status/${recordTweetData.id}`,
    timestamp,
    tags,
    mediaUrl,
    mediaType
  }
}

/**
 * Set Last Update Tweet Id to Firestore Twitter Bot Configuration
 * for continue query tweet later
 * @param {string} newest_record_id Single Tweet response from Tweet API
 */
function setLastUpdate(newest_record_id) {
  const lastUpdateTweetId = admin
    .firestore()
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE_TWEET_ID");
  lastUpdateTweetId.set({ id: newest_record_id });
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
    setLastUpdate(resp.newest_tweet_id);
    const tweets = resp.data;
    tweets.map(async (item) => {
      const recordTweet = await TwitterApi.getRecordTweetDetails(item);
      if (recordTweet.data && shouldSaveTweet(recordTweet.data)) {
        const recordData = getRecordData(item, recordTweet);
        await saveTweetToDb(recordData);
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
