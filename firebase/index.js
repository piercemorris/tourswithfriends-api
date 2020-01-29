const Firebase = require("firebase-admin");

const key = require("../privatekey.json");

var firebaseConfig = {
  credential: Firebase.credential.cert(key),
  apiKey: "AIzaSyDUBTicIY6MlpuCptBwr3G15Pfdh1z6PwU",
  authDomain: "city-tours-with-friends.firebaseapp.com",
  databaseURL: "https://city-tours-with-friends.firebaseio.com",
  projectId: "city-tours-with-friends",
  storageBucket: "city-tours-with-friends.appspot.com",
  messagingSenderId: "1091067476362",
  appId: "1:1091067476362:web:6d597d1310c82d9ba13073",
  measurementId: "G-36X23K6Z6S"
};

const init = () => {
  const connection = Firebase.initializeApp(firebaseConfig);
  if (connection) console.log("Firebase connected @" + Date.now());
};

exports.init = init;
