import * as functions from "firebase-functions";
const firebase = require("firebase-admin");
import { TsGooleDrive } from "ts-google-drive";

const PROJECT_ID = "fact-finder-app";
const REGION = "asia-southeast1";

// Schedule configs
const TZ = "Asia/Bangkok";
// Run every minute!
const SCHEDULE = "* * * * *";

// Drive default configs
const DEFAULT_UPLOAD_FOLDER_ID = "10Tqb4HkVjUO6ruyE8qhbrH6pP8JqbGFl";
const DEFAULT_PROCESSED_FOLDER_ID = "1KSrbCxb023YG6x353as4qcLZ5WlHZja0";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

function isProduction(): boolean {
  // TODO Should we load this flag from env?
  return false;
}

function getDriveConfig(): any {
  /*
  {
    "drive": {
      "serviceAccount": {
        ... service-account.json ...
      },
      "uploadFolderId": "",
      "processedFolderId": ""
    }
  }
  */
  return functions.config()["drive"];
}

function getDriveServiceAccount(): any {
  return getDriveConfig()["service_account"];
}

function getUploadFolderId(): string {
  try {
    return getDriveConfig()["upload_folder_id"];
  } catch (e) {
    // Return default value if runtime config is not available
    return DEFAULT_UPLOAD_FOLDER_ID;
  }
}

function getProcessedFolderId(): string {
  try {
    return getDriveConfig()["processed_folder_id"];
  } catch (e) {
    // Return default value if runtime config is not available
    return DEFAULT_PROCESSED_FOLDER_ID;
  }
}
// === FIREBASE SPECIFIC IMPLEMENTATION ===

// *** *** ***
// THIS SOURCE FILE IS FOLLOWING THE DOCUMENTATION AVAILABLE ON:
// https://vuefire.vuejs.org/vuefire/getting-started.html#plugin
// *** *** ***

var fb;

if (!firebase.apps.length) {
  fb = firebase.initializeApp({ projectId: PROJECT_ID });
} else {
  fb = firebase.app(); // if already initialized, use that one
}

// Get a Firestore instance
const db = fb.firestore();

function collection(collectionPath: string): any {
  if (!collectionPath) {
    return null;
  }
  collectionPath = collectionPath.toString();

  if (collectionPath.startsWith("/")) {
    // Strip "/" at the beginning off
    collectionPath = collectionPath.substring(1);
  }

  if (!isProduction()) {
    // Running under DEV env
    collectionPath = "env/dev/" + collectionPath;
  }

  return db.collection(collectionPath);
}

// === END of FIREBASE SPECIFIC IMPLEMENTATION ===

// Declare drive instance
const drive = new TsGooleDrive({credentials: getDriveServiceAccount()});

function createRecord(record: any): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    if (!record) {
      reject("The parameter \"record\" must be specified.");

      return;
    } else if (typeof record !== 'object') {
      reject("The parameter \"record\" must be an \"object\".");

      return;
    }

    // Calling .doc() without parameter = use auto-generated id.
    // see: https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference#doc

    // TODO If we move from firebase to other data store, edit THIS!
    collection("records").doc().set(record).then(() => {
      resolve();
    }).catch((err: any) => {
      reject(err);
    });
  });
}

function funcName(name: string): string {
  if (!name) {
    name = "default";
  }

  if (!isProduction()) {
    name = "dev_" + name;
  }

  return name;
}

exports[funcName("scoutGDrive")] = functions.region(REGION).pubsub.schedule(SCHEDULE).timeZone(TZ).onRun((context: any) => {
  const uploadFolder = getUploadFolderId();
  const processedFolder = getProcessedFolderId();

  return Promise.resolve().then(() => {
    // First, list files in upload folder.
    return drive
      .query()
      .inFolder(uploadFolder)
      .run();
  }).then((files) => {
    console.log(files);
  });
});
