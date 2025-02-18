// firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database'; // Import Realtime Database instead of Firestore
import 'firebase/compat/storage'; // Import Firebase Storage

// firebaseConfig.js
export const firebaseConfig = {
  apiKey: "AIzaSyBJBOOWRke9QqMONWlm8-emQEVFlaw6imc",
  authDomain: "capstone-4e6d8.firebaseapp.com",
  databaseURL: "https://capstone-4e6d8-default-rtdb.firebaseio.com",
  projectId: "capstone-4e6d8",
  storageBucket: "capstone-4e6d8.appspot.com",
  messagingSenderId: "408999186253",
  appId: "1:408999186253:android:da0ed4fa6591e988d2f104",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
