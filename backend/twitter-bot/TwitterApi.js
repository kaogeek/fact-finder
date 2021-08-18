const { httpRequest } = require('./httpRequest');
const { Headers } = require('node-fetch');

const BEARER_TOKEN = ""; // TODO Move to secret files
const FACTFINDERBOT_TWITTER_USER_ID = "1426892356142342146";
const TWITTER_FIELDS = "attachments,author_id,conversation_id,geo,created_at,entities,public_metrics,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld";

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
}

var myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${BEARER_TOKEN}`);

exports.getMentionedTweet = async (lastUpdateTweetId) => {
    // TODO query by lastUpdateTweetId
    const url = `https://api.twitter.com/2/users/${FACTFINDERBOT_TWITTER_USER_ID}/mentions`;
    const params = {
        max_results: 5,
        "tweet.fields": TWITTER_FIELDS,
    };
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    const data = await httpRequest(url, params, requestOptions);
    return data || [];
}

function getReportType(tweet) {
    if(tweet.referenced_tweets && tweet.referenced_tweets[0].type === "quoted") {
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
}

async function getTweetDetailexports(twitterId) {
    const url = `https://api.twitter.com/2/tweets/${twitterId}`;
    const params = {
        "tweet.fields": TWITTER_FIELDS,
    };
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    const data = await httpRequest(url, params, requestOptions);
    return data || false;
}
