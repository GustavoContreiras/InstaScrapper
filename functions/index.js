const functions = require('firebase-functions');
const express = require('express');
const app = express();
const port = 3000;

app.listen(port, function() {
    console.log('Listening to port ' + port)
})

app.get('/ping', (req, res) => {
    res.send('Worked')
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.app = functions.https.onRequest(app);