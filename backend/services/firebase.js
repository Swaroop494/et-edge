const admin = require('firebase-admin');

if (!admin.apps.length) {
    // If we have a project ID and no service account, try initializing with just project ID
    // (Note: This works if the environment has authenticated credentials or ADC).
    // If not, it will fail on firestore access, which we can then address.
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
}

const db = admin.firestore();

module.exports = { admin, db };
