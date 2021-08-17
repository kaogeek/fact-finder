const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const admin = require('firebase-admin');
admin.initializeApp();

exports.scoutTwitter = functions.pubsub.schedule("0 7 * * *").onRun((context) => {
    const dateTimeNow = new Date();
    const writeResult = admin.firestore().collection('twitterBotConfig').doc("LAST_UPDATE");
    writeResult.set({ date: dateTimeNow });
    functions.logger.info(`Last Update: ${dateTimeNow.toString()} (ID: ${writeResult.id})`);
    response.send(`Last Update: ${dateTimeNow.toString()}`);
});

exports.scountTwitterLastUpdate = functions
  .https.onRequest(async (request, response) => {
    const configRef = await admin.firestore().collection('twitterBotConfig');
    const lastUpdateRef = await configRef.doc("LAST_UPDATE").get();
    functions.logger.info(`Last Update: ${lastUpdateRef.data().date.toDate().toString()}`, {structuredData: true});
    response.send(`Last Update: ${lastUpdateRef.data().date.toDate().toString()}`);
});
