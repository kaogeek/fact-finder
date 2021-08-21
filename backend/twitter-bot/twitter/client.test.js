const {
  TWITTER_TOKEN,
  TWITTER_API_URL,
  TWITTER_MAX_RESULTS,
} = require("../config");
const { TwitterClient } = require("./client");
const Ajv = require("ajv");

describe("TwitterClient", () => {
  it("initialize should initialize the client with sane defaults", () => {
    const twt = TwitterClient.initialize();

    expect(twt.url).toEqual(TWITTER_API_URL);
    expect(twt.token).toEqual(TWITTER_TOKEN);
  });

  describe("getMentionedTweets", () => {
    it("should return an array of tweets", async () => {
      const twt = TwitterClient.initialize();
      const tweets = await twt.getMentionedTweets();
      const ajv = new Ajv({allErrors: true});

      const schema = {
        type: "object",
        properties: {
          attachments: { type: "object" },
          author_id: { type: "string" },
          conversation_id: { type: "string" },
          geo: { type: "object" },
          created_at: { type: "string" },
          entities: { type: "object" },
          public_metrics: { type: "object" },
          id: { type: "string" },
          in_reply_to_user_id: { type: "string" },
          lang: { type: "string" },
          possibly_sensitive: { type: "boolean" },
          referenced_tweets: { type: "array" },
          source: { type: "string" },
          text: { type: "string" },
        },
      };

      const validate = ajv.compile(schema);

      tweets.forEach((t) => {
        const isValid = validate(t)
        if (!isValid) {
          console.warn(validate.errors);
          console.warn(t);
        }
        expect(isValid).toBe(true);
      });
      expect(tweets.length).toEqual(TWITTER_MAX_RESULTS);
    });
  });
});
