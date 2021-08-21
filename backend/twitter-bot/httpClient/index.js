const axios = require("axios");
const { TWITER_API_URL, TWITTER_TOKEN, TWITTER_MAX_RESULTS, TWITTER_FIELDS } = require("../config");

const client = axios.create({
  baseURL: TWITER_API_URL,
});

client.defaults.headers.common["Authorization"] = `Bearer ${TWITTER_TOKEN}`;

const FACTFINDERBOT_TWITTER_USER_ID = "1426892356142342146";
const mentionedTweetsPath = `/users/${FACTFINDERBOT_TWITTER_USER_ID}/mentions`;
async function getMentionedTweetsAPI() {
  return await client.get(mentionedTweetsPath, {
    params: {
      max_results: TWITTER_MAX_RESULTS,
      "tweet.fields": TWITTER_FIELDS,
    },
  });
}

async function getTweetDetailexportsAPI(tweetId) {
  return await client.get(`/tweets/${tweetId}`, {
    params: {
      "tweet.fields": TWITTER_FIELDS,
    },
  });
}

exports.getMentionedTweetsAPI = getMentionedTweetsAPI;
exports.getTweetDetailexportsAPI = getTweetDetailexportsAPI;
