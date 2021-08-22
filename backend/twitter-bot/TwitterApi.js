const { httpRequest } = require("./httpRequest");
const { Headers } = require("node-fetch");

const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAPL8SgEAAAAAVINsh%2Blm0a934a1JCw5MGxaPIo4%3DacGe8TGQtFTUnMZ08WP8Lj92x7ebuq8WMpK2FaRe779ROeFUPh"; // TODO Move to secret files
const FACTFINDERBOT_TWITTER_USER_ID = "1426892356142342146";
const TWITTER_FIELDS =
  "attachments,author_id,conversation_id,geo,created_at,entities,public_metrics,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld";

/**
 * When user report tweet, there are different type of report
 * We need to retrieve data differently based on report type.
 *
 * ## Types of Report Tweet
 * Type 1: Quote tweet
 * - https://twitter.com/pbjandbi321/status/1427618809838411783
 *
 * Type 2: Reply Tweet
 * - https://twitter.com/TeamsupportMFP/status/1427554473761591296
 *
 * Type 3: Direct Tweet
 * - https://twitter.com/SugarbunnyYa/status/1427440884287635460
 *
 */
const ENUM_REPORT_TYPE = {
  DIRECT: "DIRECT",
  QUOTE: "QUOTE",
  REPLY: "REPLY",
};

const headers = new Headers();
headers.append("Authorization", `Bearer ${BEARER_TOKEN}`);

const requestOptions = {
  method: "GET",
  headers,
  redirect: "follow",
};

// eslint-disable-next-line no-unused-vars
exports.getMentionedTweet = async (lastUpdateTweetId) => {
  // TODO query by lastUpdateTweetId
  const url = `https://api.twitter.com/2/users/${FACTFINDERBOT_TWITTER_USER_ID}/mentions`;

  let userMentions = [];
  let newest_tweet_id = lastUpdateTweetId.data() ? lastUpdateTweetId.data().id : 0;

  const params = {
    "max_results": 5,
    "tweet.fields": TWITTER_FIELDS,
    "expansions": "attachments.media_keys,geo.place_id",
    "user.fields": "username",
    "media.fields": "duration_ms,type,url,preview_image_url",
    "place.fields": "geo,id",
    "since_id": newest_tweet_id,
  }

  const resp = await httpRequest(url, params, requestOptions);
  if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
    if (resp.data) {
      userMentions = resp.data;
    }
    if (resp.meta.newest_id && newest_tweet_id < resp.meta.newest_id){
      newest_tweet_id = resp.meta.newest_id;
    }
  }
  console.log(`Got ${userMentions.length} mentions`);
  return {"data": userMentions, "newest_tweet_id": newest_tweet_id};
};

function getReportType(tweet) {
  if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "quoted") {
    return ENUM_REPORT_TYPE.QUOTE;
  } else if (tweet.conversation_id !== tweet.id) {
    return ENUM_REPORT_TYPE.REPLY;
  }

  return ENUM_REPORT_TYPE.DIRECT;
}

exports.getRecordTweetDetails = async (tweet) => {
  const reportType = getReportType(tweet);
  if (reportType === ENUM_REPORT_TYPE.QUOTE) {
    return await getTweetDetailexports(tweet.referenced_tweets[0].id);
  }
  return await getTweetDetailexports(tweet.conversation_id);
};

async function getTweetDetailexports(twitterId) {
  const url = `https://api.twitter.com/2/tweets/${twitterId}`;

  const params = {
    "tweet.fields": "attachments,conversation_id,geo,created_at,entities,public_metrics,id",
    "expansions": "attachments.media_keys,geo.place_id",
    "user.fields": "username",
    "media.fields": "duration_ms,type,url,preview_image_url",
    "place.fields": "geo,id"
  };

  const resp = await httpRequest(url, params, requestOptions);
  return resp || false;
}
