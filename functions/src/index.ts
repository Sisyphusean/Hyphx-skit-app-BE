import * as firebaseFunctions from 'firebase-functions';
import * as admin from 'firebase-admin';

const initializedFirebaseAdmin = admin.initializeApp(
    {
        credential: admin.credential.cert({
            projectId: firebaseFunctions.config().fbase.project_id as string,
            clientEmail: firebaseFunctions.config().fbase.client_email as string,
            privateKey: firebaseFunctions.config().fbase.private_key.replace(/\\n/g, '\n')
        }),
        databaseURL: `https://${firebaseFunctions.config().fbase.project_id}.firebaseio.com`
    }
);

const livestreamCollection = firebaseFunctions.config().db.livestream_collection as string;
const liveStreamDocument = firebaseFunctions.config().db.livestream_document_id as string;
const liveStreamTopic = firebaseFunctions.config().topics.livestream_topic as string;

export const sendLiveStreamNotification = firebaseFunctions.firestore.document(`${livestreamCollection}/${liveStreamDocument}`)
    .onUpdate(
        async (change) => {

            try {
                const newData = change.after.data()
                let message;

                if (newData.streamingOn !== "none") {
                    message = {
                        topic: liveStreamTopic,
                        notification: {
                            title: "Hx is live!",
                            body: `Hx is now live on ${newData.streamingOn}!`
                        }
                    };
                } else {
                    message = {
                        topic: liveStreamTopic,
                        notification: {
                            title: "Hx is no longer live!",
                            body: `Hx's stream has ended`
                        }
                    };
                }

                await initializedFirebaseAdmin.messaging().send(message);
                console.log("Successfully sent live notification");
            } catch (error) {
                console.error("Failed to send Notification", error);
            }

        });