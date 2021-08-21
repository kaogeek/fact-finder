const { logger } = require("firebase-functions/v1");
const { GeoPoint } = require("@google-cloud/firestore");
const { mockCoordinate } = require("./mockData");

// eslint-disable-next-line no-unused-vars
function getTimestamp(recordTweet, infoTweet) {
    // TODO, logic to add exif or data from reporter
    return {
        source: new Date(recordTweet.created_at),
    };
}

// eslint-disable-next-line no-unused-vars
function getCoordinates(recordTweet, infoTweet) {
    // TODO Remove this Mock Geo Data
    function getRandomLatLonCloseTo(center) {
        const randomErrorLat = Math.random()*0.02-0.01;
        const randomErrorLon = Math.random()*0.02-0.01;
        return new GeoPoint(center.lat + randomErrorLat, center.lon + randomErrorLon);
    }

    return {
        exif: (Math.random() > 0.7) ? getRandomLatLonCloseTo(mockCoordinate.dinDaeng) : null,
        reporter: (Math.random() > 0.5) ? getRandomLatLonCloseTo(mockCoordinate.dinDaeng) : null,
        source: (Math.random() > 0.3) ? getRandomLatLonCloseTo(mockCoordinate.dinDaeng) : null,
    };
}

function mapReporterRoles(author) {
    // TODO map proper reporter roles
    // This is dummy logic
    // it should load from DB
    if (["Thairath_News"].includes(author.name)) {
        return [{ name: "MEDIA" }];
    }
    return [{ name: "GENERAL" }];
}

function getReporter(recordTweet) {
    const author = recordTweet.includes.users.find(item => item.id === recordTweet.author_id);
    const roles = mapReporterRoles(author);
    return {
        roles,
        id: recordTweet.author_id, 
        displayName: author.name,
        platform: "TWITTER",
        url: `https://twitter.com/${author.name}`,
    };
}

function getTags(recordTweet, infoTweet) {
    const recordTweetTags = recordTweet.entities.hashtags ? recordTweet.entities.hashtags.map(item => item.tag) : [];
    const infoTweetTags = infoTweet.entities.hashtags ? infoTweet.entities.hashtags.map(item => item.tag) : [];
    const saveTags = new Set(recordTweetTags.concat(infoTweetTags));
    return saveTags.size > 0 ? [...saveTags] : [];
}

exports.constructRecordFromTweet = function(recordTweet, infoTweet) {
    // TODO Save engagement data
    logger.info(`Constructing record from record tweet: ${recordTweet.id} and info tweet: ${infoTweet.id}`);
    const recordModels = [];
    recordTweet.attachments.media_keys.map(mediaKey => {
        const eachMedia = recordTweet.includes.media.find(item => item.media_key === mediaKey);
        const recordModel = {
          referenceId: recordTweet.id,
          referenceType: "TWIITER",
          referenceUrl: `https://twitter.com/user/status/${recordTweet.id}`,
          mediaType: eachMedia.type.toUpperCase(),
          mediaUrl: (eachMedia.type === "video") ? eachMedia.preview_image_url : eachMedia.url,
          tags: getTags(recordTweet, infoTweet), // TODO merge hashtags with info tweet and remove duplicate
          timestamp: getTimestamp(recordTweet, infoTweet),
          coordinates: getCoordinates(recordTweet, infoTweet),
          reporter: getReporter(recordTweet),
          text: [recordTweet.text, infoTweet.text].join(" ||||| "), // TODO create useful text for post process later.
          weight: 5, // TODO logic to decide proper weight
          eventId: 0, // TODO add event_id
        };
        recordModels.push(recordModel);
    });
    return recordModels;
}
