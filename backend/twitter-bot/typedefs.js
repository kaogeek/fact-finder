/**
 * @typedef publicMetrics
 * @property {number} retweet_count
 * @property {number} reply_count
 * @property {number} like_count
 * @property {number} quote_count
 */

/**
 * @typedef media
 * @property {string} media_key
 * @property {preview_image_url} preview_image_url
 * @property {video|photo} type
 */

/**
 * @typedef place
 * @property {string} id
 * @property {string} full_name
 */

/**
 * @typedef user
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef infoTweet
 * @property {number} id
 * @property {publicMetrics} public_metrics
 * @property {{media_keys: string[]}} attachments
 * @property {string} author_id
 */

/**
 * @typedef recordTweet Tweet that has record information
 * @property {number} id
 * @property {publicMetrics} public_metrics
 * @property {{media_keys: string[]}} attachments
 * @property {string} author_id
 * @property {{media: media[], users: user[], places: place[]}} includes
 */




exports.unused = {};
