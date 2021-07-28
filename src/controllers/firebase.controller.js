// Node.js
var admin = require("firebase-admin");

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://test-afrilearn.firebaseio.com",
});

async function sendMessage() {
  // Fetch the tokens from an external datastore (e.g. database)
  //   const tokens = await getTokensFromDatastore();

  // Send a message to devices with the registered tokens
  await admin.messaging().sendMulticast({
    tokens: ["60941a8a1523405f74ddb94e"], // ['token_1', 'token_2', ...]
    data: { hello: "world!" },
  });
  console.log("tokens", tokens);
}

// Send messages to our users
sendMessage();
