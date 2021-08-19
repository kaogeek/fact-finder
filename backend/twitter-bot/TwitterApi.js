const { httpRequest } = require("./httpRequest");
const { Headers } = require("node-fetch");

const BEARER_TOKEN = ""; // TODO Move to secret files
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

// eslint-disable-next-line no-unused-vars
exports.getMentionedTweet = async (lastUpdateTweetId) => {
  // TODO query by lastUpdateTweetId
  const url = `https://api.twitter.com/2/users/${FACTFINDERBOT_TWITTER_USER_ID}/mentions`;
  var userMentionsTimelineHeader = new Headers();
  userMentionsTimelineHeader.append("Authorization", `Bearer ${BEARER_TOKEN}`);
  userMentionsTimelineHeader.append("User-Agent", "v2UserMentionssJS");

  const requestOptions = {
    method: "GET",
    headers: userMentionsTimelineHeader,
    redirect: "follow",
  };

  let userMentions = [];
  let hasNextPage = true;
  let nextToken = null;
  let newest_id = lastUpdateTweetId.data() ? lastUpdateTweetId.data().id : 0;

  let params = {
      "max_results": 100,
      "tweet.fields": "conversation_id,referenced_tweets",
      "since_id": newest_id,
  }

  console.log("Retrieving mentions...");

  while (hasNextPage) {

    if (nextToken) {
      params.pagination_token = nextToken;
    }

    let resp = await httpRequest(url, params, requestOptions);
    if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
      if (resp.data) {
        userMentions.push.apply(userMentions, resp.data);
      }
      if (resp.meta.next_token) {
        nextToken = resp.meta.next_token;
      } else {hasNextPage = false;}
    } else {
      hasNextPage = false;
    }
    if (resp && resp.meta && resp.meta.newest_id && newest_id < resp.meta.newest_id){
      newest_id = resp.meta.newest_id;
    }

  }

  console.log(`Got ${userMentions.length} mentions`);
  return {"data": userMentions, "newest_id": newest_id};
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
  var tweetLookUpHeader = new Headers();
  tweetLookUpHeader.append("Authorization", `Bearer ${BEARER_TOKEN}`);
  tweetLookUpHeader.append("User-Agent", "v2TweetLookupJS");
  const url = `https://api.twitter.com/2/tweets/${twitterId}`;
  const params = {
    "tweet.fields": TWITTER_FIELDS,
  };
  const requestOptions = {
    method: "GET",
    headers: tweetLookUpHeader,
    redirect: "follow",
  };
  const resp = await httpRequest(url, params, requestOptions);
  return resp.data || false;
}
