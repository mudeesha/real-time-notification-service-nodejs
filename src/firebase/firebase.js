const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json'); // your downloaded key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
