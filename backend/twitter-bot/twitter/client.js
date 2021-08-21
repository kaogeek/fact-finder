const {
  TWITTER_TOKEN,
  TWITTER_API_URL,
} = require("../config");
const { getMentionedTweetsAPI, getTweetDetailexportsAPI } = require("../httpClient");

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

let twtClient = null;

const getTweetDetailPath = twitterId => `/tweets/${twitterId}`;

function getReportType(tweet) {
  if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "quoted") {
    return ENUM_REPORT_TYPE.QUOTE;
  } else if (tweet.conversation_id !== tweet.id) {
    return ENUM_REPORT_TYPE.REPLY;
  }

  return ENUM_REPORT_TYPE.DIRECT;
}

async function getRecordTweetDetails(tweet) {
  const reportType = getReportType(tweet);
  if (reportType === ENUM_REPORT_TYPE.QUOTE) {
    return await getTweetDetailexports(tweet.referenced_tweets[0].id);
  }

  return await getTweetDetailexports(tweet.conversation_id);
}

async function getTweetDetailexports(tweetId) {
  try {
    const {data: { data } } = await getTweetDetailexportsAPI(tweetId)
    return data;
  } catch (e) {
    // Error: probably rate limited
    console.error(e);
    return false;
  }
}

class TwitterClient {
  /**
   * Returns an instance of TwitterClient
   * @returns {TwitterClient}
   */
  static initialize() {
    if (twtClient !== null) {
      return twtClient;
    }
    return new TwitterClient({ url: TWITTER_API_URL, token: TWITTER_TOKEN });
  }

  constructor({ url, token }) {
    this.url = url;
    this.token = token;
    this.getMentionedTweets = this.getMentionedTweets.bind(this);
  }

  async getMentionedTweets() {
    const {
      status,
      data: { data: tweets },
    } = await getMentionedTweetsAPI()

    if (status !== 200) {
      console.error({
        message: "Error getting response from twitter",
        statusCode: status,
        error: data,
      });
      return [];
    }

    return await Promise.all(tweets.map(getRecordTweetDetails));
  }
}

exports.TwitterClient = TwitterClient;
