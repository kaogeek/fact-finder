import * as functions from "firebase-functions";
import firebase = require("firebase-admin");
import { TsGooleDrive } from "ts-google-drive";
import { GOOGLE_DRIVE_API } from "ts-google-drive/build/TsGooleDrive";
const ExifImage = require("exif").ExifImage;

const PROJECT_ID = "fact-finder-app";
const REGION = "asia-southeast1";

// Schedule configs
const TZ = "Asia/Bangkok";
// Run every minute!
const SCHEDULE = "* * * * *";

// Drive default configs
const DEFAULT_UPLOAD_FOLDER_ID = "10Tqb4HkVjUO6ruyE8qhbrH6pP8JqbGFl";
const DEFAULT_ARCHIVE_FOLDER_ID = "1Nq1kJ5uasJ6qJkFwsXmhvyFZ_jGlroua";
const DEFAULT_PROCESSED_FOLDER_ID = "1KSrbCxb023YG6x353as4qcLZ5WlHZja0";
const DEFAULT_MAX_FILES_SIZE = 30; // The maximun file count to be processed for each execution
const DEFAULT_TIME_ZONE = "+07:00"; // Use this timezone if "TimeZoneOffset" does not present in EXIF

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
      ...
      "serviceAccount": {
        ... service-account.json ...
      },
      "uploadFolderId": "",
      "processedFolderId": "",
      ...
    }
  }
  see: ../remoteconfig.template.json for more details
  */
  return functions.config()[!isProduction() ? "dev_drive" : "drive"];
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

function getArchiveFolderId(): string {
  try {
    return getDriveConfig()["archive_folder_id"];
  } catch (e) {
    // Return default value if runtime config is not available
    return DEFAULT_ARCHIVE_FOLDER_ID;
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

function getMaxFilesSize(): number {
  try {
    return parseInt(getDriveConfig()["max_files_size"]);
  } catch (e) {
    // Return default value if runtime config is not available
    return DEFAULT_MAX_FILES_SIZE;
  }
}

function getTimeZone(): string {
  try {
    return getDriveConfig()["time_zone"];
  } catch (e) {
    // Return default value if runtime config is not available
    return DEFAULT_TIME_ZONE;
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

    // First, check that the given record's "reporter" already exists or not?
    // If not, create a new one.
    let reporterId: string = Object.keys(record.reporter)[0];

    collection("users").doc(reporterId).get().then((snapshot: any) => {
      // The given "reporterId" does not exist.
      if (!snapshot.exists) {
        // Create a new one.
        return snapshot.ref.set(record.reporter[reporterId]).then(() => {
          return reporterId;
        });
      } else {
        // It does exist, just return its id.
        return reporterId;
      }
    }).then((reporterId: string) => {
      // Force set record's "reporter" pointing to its reference.
      record.reporter = collection("users").doc(reporterId);

      // Firebase specific, we need to convert coordinates to GeoPoint.
      if (record.coordinates) {
        if (record.coordinates.exif) {
          record.coordinates.exif = new firebase.firestore.GeoPoint(record.coordinates.exif.lat, record.coordinates.exif.lng);
        }
        if (record.coordinates.reporter) {
          record.coordinates.reporter = new firebase.firestore.GeoPoint(record.coordinates.reporter.lat, record.coordinates.reporter.lng);
        }
        if (record.coordinates.source) {
          record.coordinates.source = new firebase.firestore.GeoPoint(record.coordinates.source.lat, record.coordinates.source.lng);
        }
      }

      // Save record into firestore
      return collection("records").doc().set(record);
    }).then(() => {
      resolve();
    }).catch((err: any) => {
      reject(err);
    });
  });
}

// Declare drive instance
const drive = new TsGooleDrive({ credentials: getDriveServiceAccount() });

class Coordinates {
  constructor(public lat?: number | null, public lng?: number | null) { }
}

class EXIFInfo {
  constructor(public coordinates?: Coordinates | null, public timestamp?: Date | null) { }
}

/**
* To check that the given file is a supported mime type or not?
**/
function isSupportFile(file: any): boolean {
  if (!file || !file.mimeType) {
    return false;
  }

  let mimeType = file.mimeType.toString().toLowerCase();

  // We do only accept image/* and video/*
  return mimeType.startsWith("image/") || mimeType.startsWith("video/");
}

function toDecimalLatLng(degree: any[]): number | null {
  if (!degree) {
    return null;
  }
  if (degree.length !== 3) {
    return null;
  }

  // To convert degree unit to decimal unit, please see:
  // https://en.wikipedia.org/wiki/Geographic_coordinate_conversion
  return degree[0] + (degree[1] / 60) + (degree[2] / 3600);
}

function toDate(exifDate: string, tzOffset: any): Date | null {
  if (!exifDate) {
    return null;
  }
  if (tzOffset === null || tzOffset === undefined) {
    tzOffset = getTimeZone();
  } else if (typeof tzOffset === "number") {
    if (tzOffset === 0) {
      tzOffset = "Z";
    } else if (tzOffset > 0) {
      tzOffset = "+" + tzOffset;
    } else {
      tzOffset = "-" + tzOffset;
    }
  } else {
    tzOffset = getTimeZone();
  }

  let dateStr: string = exifDate.substring(0, exifDate.indexOf(" ")).trim();
  let timeStr: string = exifDate.substring(exifDate.indexOf(" ") + 1).trim();

  dateStr = dateStr.split(":").join("-");

  let fullDateStr: string = dateStr + "T" + timeStr + tzOffset;

  return new Date(fullDateStr);
}

function extractEXIF(buffer: Buffer): Promise<EXIFInfo> {
  if (!buffer) {
    return Promise.reject("The parameter \"buffer\" is null or undefined.");
  }

  return new Promise<EXIFInfo>((resolve, reject) => {
    try {
      new ExifImage({ image: buffer }, function(error: any, exifData: any) {
        if (error) {
          reject(error);
        } else {
          let ts = null;
          // First, we'll use "DateTimeOriginal" tag.
          ts = !ts && exifData.exif["DateTimeOriginal"] ? toDate(exifData.exif["DateTimeOriginal"].toString(), exifData.exif["TimeZoneOffset"] ? exifData.exif["TimeZoneOffset"][0] : null) : ts;
          // If it is not available, fallback to "CreateDate".
          ts = !ts && exifData.exif["CreateDate"] ? toDate(exifData.exif["CreateDate"].toString(), exifData.exif["TimeZoneOffset"] ? exifData.exif["TimeZoneOffset"][0] : null) : ts;

          let lat = null;
          let lng = null;

          if (exifData.gps) {
            if (exifData.gps["GPSLatitude"]) {
              lat = toDecimalLatLng(exifData.gps["GPSLatitude"]);

              // S = South -> negative latitude value
              if (lat !== null && exifData.gps["GPSLatitudeRef"] && "S" === exifData.gps["GPSLatitudeRef"].toString().toUpperCase()) {
                lat = -lat;
              }
            }
            if (exifData.gps["GPSLongitude"]) {
              lng = toDecimalLatLng(exifData.gps["GPSLongitude"]);

              // W = West -> negative latitude value
              if (lng !== null && exifData.gps["GPSLongitudeRef"] && "W" === exifData.gps["GPSLongitudeRef"].toString().toUpperCase()) {
                lng = -lng;
              }
            }
          }

          resolve({
            timestamp: ts,
            coordinates: lat || lng ? new Coordinates(lat, lng) : null
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function getFileResp(file: any, params?: any): Promise<any> {
  let client = (file as any)._getClient();

  return client.request({
    baseURL: GOOGLE_DRIVE_API,
    url: `/files/${file.id}`,
    method: "GET",
    params: params
  });
}

async function getFileOwner(file: any): Promise<any> {
  return getFileResp(file, {
    "fields": "owners"
  }).then(resp => {
    return resp.data.owners[0];
  });
}

/**
* @returns A Promise of `records` to be created
**/
async function processImage(file: any, buffer: Buffer): Promise<any> {
  // Try to extract EXIF data first
  return extractEXIF(buffer).catch(e => {
    // Cannot extract EXIF from image, log an error.
    console.error(e);
    // Then, return an empty EXIFInfo object.
    return new EXIFInfo(null, null);
  }).then(async (exif: EXIFInfo) => {
    return getFileOwner(file).then(owner => {
      let reporterId = "google:" + owner.emailAddress;

      let record = {
        "mediaType": "IMAGE",
        "mediaUrl": `https://drive.google.com/uc?export=download&id=${file.id}`,
        "referenceType": "GOOGLE_DRIVE",
        "referenceUrl": `https://drive.google.com/file/d/${file.id}/view?usp=sharing`,
        "reporter": {
          [reporterId]: {
            "displayName": owner.displayName,
            "platform": "GOOGLE",
            "roles": [],
            "url": owner.photoLink
          }
        },
        // TODO How could we obtain tags from gdrive file?
        "tags": [],
        "timestamp": {
          "exif": exif.timestamp ? exif.timestamp : null,
          // In google drive, the user cannot edit file creation time
          // since it is generated by google drive.
          "reporter": null,
          "source": new Date(file.createdTime)
        },
        "coordinates": {
          "exif": exif.coordinates ? JSON.parse(JSON.stringify(exif.coordinates)) : null,
          // In google drive, the coordinates can only be obtained
          // via EXIF data.
          "reporter": null,
          "source": null
        }
      };

      return record;
    });
  });
}

async function moveFile(file: any, toFolderId: string): Promise<any> {
  let client = (file as any)._getClient();

  return client.request({
    baseURL: GOOGLE_DRIVE_API,
    url: `/files/${file.id}`,
    method: "PATCH",
    params: {
      // Move from upload folder to processed folder
      removeParents: file.parents[0],
      addParents: toFolderId
    }
  });
}

/**
* @returns A Promise of `records` to be created
**/
async function processVideo(file: any, buffer: Buffer): Promise<any> {
  return Promise.resolve(null);
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

exports[funcName("scoutGDrive")] = functions.region(REGION).pubsub.schedule(SCHEDULE).timeZone(TZ).onRun(async () => {
  const uploadFolder = getUploadFolderId();
  const archiveFolder = getArchiveFolderId();
  const processedFolder = getProcessedFolderId();

  // First, list files in upload folder.
  return drive.query().inFolder(uploadFolder).setPageSize(getMaxFilesSize()).run().then((files) => {
    let promises: Promise<any>[] = [];

    for (let file of files) {
      if (file.id === archiveFolder) {
        // If current file is archive folder itself, just ignore it!
        // Note: The archive folder will be in upload folder.
        continue;
      }

      if (!isSupportFile(file)) {
        // Move it to ARCHIVE !!!
        // Since file type is not supported
        // Note: We've to move to archive instead of DELETE
        // since Google Service Account might has no permission
        // to delete a file uploaded by other users.

        // Convert all rejects to resolves with "error"
        promises.push(moveFile(file, archiveFolder).catch(e => e));
      } else {
        // Process this file ...
        // Down load the file first
        promises.push(file.download().then((buffer: Buffer) => {
          let mimeType = file.mimeType.toString().toLowerCase();

          if (mimeType.startsWith("image/")) {
            // Process image file
            return processImage(file, buffer);
          } else {
            // Process video file
            return processVideo(file, buffer);
          }
        }).then((record: any) => {
          if (record) {
            // Save record into datastore
            // Force resolve "true" means to move file into processed folder.
            return createRecord(record).then(() => true);
          } else {
            // Do nothing (and leave file the same - do not move to processed folder)...
            // Force resolve "false" means to NOT move file into processed folder.
            return false;
          }
        }).then(move => {
          if (move) {
            // Move file to processed folder.
            return moveFile(file, processedFolder);
          } else {
            return Promise.resolve();
          }
        }).then(() => true).catch(e => e));
      }
    }

    // Waiting all promises to be run
    return Promise.allSettled(promises);
  }).then((results: any[]) => {
    let errors = [];

    if (results) {
      for (let result of results) {
        if (typeof result.value !== "boolean" || !result.value) {
          errors.push(result.value);
        }
      }
    }

    if (errors.length > 0) {
      console.log("FAILED with " + results.length + " file(s) processed.")
      console.log("!!! ERROR !!!");
      console.error(errors);

      return Promise.reject(errors);
    } else {
      console.log("COMPLETED with " + results.length + " file(s) processed.")

      return Promise.resolve();
    }
  });
});
