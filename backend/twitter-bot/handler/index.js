const TwitterApi = require("../twitter/client");
const { constructRecordFromTweet } = require("../db/Record");
const { db } = require("../db/firestore");
const { logger } = require("firebase-functions/v1");

/**
 * Logic to decide whether to save tweet or not.
 * @param {Tweet} recordTweet Single Tweet response from Tweet API
 */
 async function shouldSaveTweet(recordTweet) {
  logger.info("Deciding to save tweet id: ", recordTweet.id);
  const publicMetrics = recordTweet.public_metrics;
  const haveAttachments = !!recordTweet.attachments;
  const highEngagement =
    publicMetrics.retweet_count > 1000 ||
    publicMetrics.reply_count > 10 ||
    publicMetrics.like_count > 500 ||
    publicMetrics.quote_count > 20;
  if(!haveAttachments) {
    logger.info("NOT SAVE. No attachedment");
    return false;
  }
  if (!highEngagement) {
    logger.info("NOT SAVE. Low engagement");
    return false;
  }
  const haveMoreInfo = await tweetHaveMoreInfoThanRecord(recordTweet);
  if (!haveMoreInfo) {
    logger.info("NOT SAVE. No new info compare to record in database.");
    return false;
  }
  logger.info("SHOULD SAVE. Record tweet id: ", recordTweet.id);
  return true;
}

async function tweetHaveMoreInfoThanRecord(recordTweet) {
  const item = await db
  .collection("records")
  .where("referenceId", "==", recordTweet.id)
  // .where("referenceType", "==", "TWITTER") // TODO Should create composite key https://firebase.google.com/docs/firestore/query-data/queries#compound_queries
  .get();
  if (item.docs.length == 0) { // This is new tweet, we should save in db.
    return true;
  }
  // TODO Should compare if record tweet can add more info (e.g. date time, event, coordiante)
  return false;
}

/**
 * Save record tweet to database
 * @param {RecordModel} recordModel Constructed model ready to save in DB
 */
const saveRecordModelToDb = async (recordModels) => {
  recordModels.map(async (recordModel) => {
    try {
      await db
        .collection("records")
        .add(recordModel);
    } catch (e) {
      console.error("Failed to write to DB.", e);
    }
  });
  return true;
};

/**
 * Set Last Update Tweet Id to Firestore Twitter Bot Configuration
 * for continue query tweet later
 * @param {Tweet} tweet Single Tweet response from Tweet API
 */
async function setLastUpdate(tweet) {
  const lastUpdateTweetId = db
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE");
  await lastUpdateTweetId.set({ id: tweet.id, date: tweet.created_at });
}

exports.handlerFunc = async function (_, res) {
  logger.info("Running twitter scout...");
  const lastUpdateTweetRef = await db
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE")
    .get();
  const sinceId = lastUpdateTweetRef.exists && lastUpdateTweetRef.data().id ? lastUpdateTweetRef.data().id : 0;
  const [tweets, __] = await TwitterApi.getMentionedTweet({ sinceId });
  await Promise.all(tweets.map(async (infoTweet) => {
    const recordTweet = await TwitterApi.getRecordTweetDetails(infoTweet);
    if (recordTweet && await shouldSaveTweet(recordTweet)) {
      const recordModels = constructRecordFromTweet(recordTweet, infoTweet);
      await saveRecordModelToDb(recordModels);
    }
    await setLastUpdate(infoTweet);
  }));

  const afterUpdateTweetId = await db
    .collection("twitterBotConfig")
    .doc("LAST_UPDATE")
    .get();
  res.send(
    `Last Update Tweet Id: ${
      afterUpdateTweetId.data() && afterUpdateTweetId.data().id
    }`
  );
};

exports.handlerTimeMachineFunc = async function(req, res) {
  if (!req.query.date) {
    res.send("Pleae input date query string in YYYY-MM-DD format.");
    return;
  }

  const startTime = new Date(req.query.date);
  const endTime = new Date((new Date(startTime)).setDate(startTime.getDate() + 1));

  logger.info("Running twitter scout time machine for...", startTime);

  const timeMachineKey = `TIME_MACHINE_${req.query.date.replaceAll("-", "_")}`;

  const timeMachineRef = await db
    .collection("twitterBotConfig")
    .doc(timeMachineKey)
    .get();

    const paginationToken = timeMachineRef.exists && timeMachineRef.data().paginationToken ? timeMachineRef.data().paginationToken : undefined;
    const [tweets, meta] = await TwitterApi.getMentionedTweet({ 
      paginationToken,  
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
    
    if (!meta) {
      res.send("Failed to fetch data.");
      return;
    }

    await Promise.all(tweets.map(async (infoTweet) => {
      const recordTweet = await TwitterApi.getRecordTweetDetails(infoTweet);
      if (recordTweet && await shouldSaveTweet(recordTweet)) {
        const recordModels = constructRecordFromTweet(recordTweet, infoTweet);
        await saveRecordModelToDb(recordModels);
      }
    }));
  
    await db
      .collection("twitterBotConfig")
      .doc(timeMachineKey)
      .set({ paginationToken: meta.next_token })
    res.send(`Next Token: ${meta.next_token}`);
}
