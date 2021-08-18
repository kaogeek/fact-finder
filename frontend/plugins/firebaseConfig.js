import firebase from 'firebase/app'
import 'firebase/firestore'

// *** *** ***
// THIS SOURCE FILE IS FOLLOWING THE DOCUMENTATION AVAILABLE ON:
// https://vuefire.vuejs.org/vuefire/getting-started.html#plugin
// *** *** ***

var fb;

if (!firebase.apps.length) {
   fb = firebase.initializeApp({ projectId: 'fact-finder-app' });
}else {
   fb = firebase.app(); // if already initialized, use that one
}

// Get a Firestore instance
export const db = fb.firestore();

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { Timestamp, GeoPoint } = firebase.firestore
export { Timestamp, GeoPoint }
