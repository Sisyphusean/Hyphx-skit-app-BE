//Firebase Admin
import * as admin from 'firebase-admin';

//import firebaseConfig
import { firebaseConfig } from '../constants/firebaseconfig';

//Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: firebaseConfig.project_id,
        clientEmail: firebaseConfig.client_email,
        privateKey: firebaseConfig.private_key
    }),
    databaseURL: `https://${firebaseConfig.project_id}.firebaseio.com`
});

export const db = admin.firestore();

export const terminateFirebase = () => {
    admin.app().delete()
}

export interface querySnapshot extends admin.firestore.QuerySnapshot<admin.firestore.DocumentData> { }

