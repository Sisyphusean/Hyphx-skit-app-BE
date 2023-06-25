//Firebase Admin
import * as admin from 'firebase-admin';

// //import firebaseConfig
// import { firebaseConfig } from '../constants/firebaseconfig';

// //Initialize Firebase
// const projectId = firebaseConfig.project_id
// admin.initializeApp(
//     {
//         credential: admin.credential.cert(JSON.stringify(firebaseConfig)),
//         databaseURL: `https://${projectId}.firebaseio.com`
//     }
// );

export const db = admin.firestore();

export const terminateFirebase = () => {
    admin.app().delete()
}

export interface querySnapshot extends admin.firestore.QuerySnapshot<admin.firestore.DocumentData> { }

