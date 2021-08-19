## Remaining Tasks
** Please see remaining task by search `TODO` in code base **
1. [DONE] Fetch tweets and save to Firestore.
2. [WORKING] Define necessary tweet details data.
3. Add necessary tweet details into Firestore. Each type of report tweet have different way to get details.
4. Filter only important tweets.


## How to run the project
1. This project is using `firebase`. So you need to finish initial setup. Please go through this document https://firebase.google.com/docs/functions/get-started
2. We also use `Cloud Firestore`. So you might want `Emulator` to run your `Cloud Firestore` in your local machine. Please follow this document https://firebase.google.com/docs/emulator-suite/install_and_configure
3. Download configuration file by running:
```
firebase functions:config:get > .runtimeconfig.json
```
4. After you finish all this initial work, try run below command in this directory
```
npm run serve
```
5. You should able to access 2 urls
```
http://localhost:4000 ## for emulator, cloud firestore
http://localhost:5001 ## for application, see callable path in `index.js` file
```
