const admin = require('firebase-admin');
const serviceAccount = require('../../back-teste-fe405-firebase-adminsdk-hhle3-8b885b28f1');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://back-teste-fe405.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = { bucket };