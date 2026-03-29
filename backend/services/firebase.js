const admin = require('firebase-admin');

const credentialsAvailable = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!admin.apps.length && credentialsAvailable) {
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
} else if (!admin.apps.length) {
    console.warn("Firestore Error: GOOGLE_APPLICATION_CREDENTIALS missing. Running with mock data.");
}

const db = credentialsAvailable ? admin.firestore() : {
    collection: (name) => ({
        doc: (id) => ({
            get: async () => ({ exists: false }),
            add: async () => ({ id: 'mock' }),
            update: async () => ({})
        }),
        where: () => ({
            where: () => ({
                orderBy: () => ({
                    limit: () => ({
                        get: async () => ({ empty: true, size: 0, docs: [], forEach: () => {} })
                    })
                })
            }),
            orderBy: () => ({
                limit: () => ({
                    get: async () => ({ empty: true, size: 0, docs: [], forEach: () => {} })
                })
            })
        }),
        add: async () => ({ id: 'mock' }),
        limit: () => ({
            get: async () => ({ empty: true, size: 0, docs: [], forEach: () => {} }),
            orderBy: () => ({
                limit: () => ({
                    get: async () => ({ empty: true, size: 0, docs: [], forEach: () => {} })
                })
            })
        }),
        orderBy: () => ({
            limit: () => ({
                get: async () => ({ empty: true, size: 0, docs: [], forEach: () => {} })
            })
        })
    })
};

module.exports = { admin, db };
