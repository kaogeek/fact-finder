const { httpRequest } = require("../httpRequest");
const { Headers } = require("node-fetch");
const { TWITTER_TOKEN } = require("../config");

const FACTFINDERBOT_TWITTER_USER_ID = "1426892356142342146";
const TWITTER_MAX_RESULTS = 5;
const TWITTER_FIELDS =
  "attachments,author_id,conversation_id,geo,created_at,entities,public_metrics,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld";
const TWITTER_EXPANSION = "attachments.media_keys,geo.place_id,author_id";
const TWITTER_MEDIA_FIELDS = "media_key,preview_image_url,type,url";

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

var myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${TWITTER_TOKEN}`);

/**
 * 
 * @param {{sinceId: number, paginationToken: string, startTime: string, endTime: stirng}} param0 time in ISO8601 with timezone format
 * @returns {[import("../typedefs").infoTweet[], object]}
 */
// eslint-disable-next-line no-unused-vars
exports.getMentionedTweet = async ({ sinceId, paginationToken, startTime, endTime }) => {
  const url = `https://api.twitter.com/2/users/${FACTFINDERBOT_TWITTER_USER_ID}/mentions`;
  const params = {
    max_results: TWITTER_MAX_RESULTS,
    "tweet.fields": TWITTER_FIELDS,
    "media.fields": TWITTER_MEDIA_FIELDS,
    "expansions": TWITTER_EXPANSION,
    "since_id": sinceId ,
    "pagination_token": paginationToken,
    "start_time": startTime,
    "end_time": endTime,
  };

  // TODO, is there any better way to create object just the property that is not undefined :D ?
  for (const i in params)  
    if (typeof params[i] === "undefined")   
      delete params[i]; 

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await httpRequest(url, params, requestOptions);
  return response ? response.data.reverse() && [response.data, response.meta] : [[], false];
};
 
function getReportType(tweet) {
  if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "quoted") {
    return ENUM_REPORT_TYPE.QUOTE;
  } else if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "replied_to") {
    return ENUM_REPORT_TYPE.REPLY;
  }

  return ENUM_REPORT_TYPE.DIRECT;
}

/**
 * 
 * @param {import("../typedefs").infoTweet} infoTweet 
 * @returns {import("../typedefs").recordTweet}
 */
exports.getRecordTweetDetails = async (infoTweet) => {
  const reportType = getReportType(infoTweet);
  if (reportType === ENUM_REPORT_TYPE.QUOTE || reportType === ENUM_REPORT_TYPE.REPLY) {
    return await getTweetDetailexports(infoTweet.referenced_tweets[0].id);
  }

  return await getTweetDetailexports(infoTweet.id);
};

function mapToRecordTweet(response) {
  if (response.includes) {
    response.data.includes = response.includes;
  }
  return response.data;
}

/**
 * 
 * @param {number} twitterId 
 * @returns {import("../typedefs").recordTweet}
 */
async function getTweetDetailexports(twitterId) {
  const url = `https://api.twitter.com/2/tweets/${twitterId}`;
  const params = {
    "tweet.fields": TWITTER_FIELDS,
    "media.fields": TWITTER_MEDIA_FIELDS,
    "expansions": TWITTER_EXPANSION,
  };
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await httpRequest(url, params, requestOptions);
  const recordTweet = mapToRecordTweet(response)
  return recordTweet;
}

