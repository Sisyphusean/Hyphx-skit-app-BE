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

const livestreamCollectionString = firebaseFunctions.config().db.livestream_collection as string;
const liveStreamDocumentString = firebaseFunctions.config().db.livestream_document_id as string;
const liveStreamTopicString = firebaseFunctions.config().topics.livestream_topic as string;
const fcmDetailsCollectionString = firebaseFunctions.config().db.fcm_details_collection as string;


/**
 * This function batch unsubscribes tokens from all existing topics
 * @param {string[]} tokensArray This is an array of tokens to unsubscribe from the topic
 * @returns {Promise<MessagingTopicManagementResponse[]>} This is a promise that resolves to an array of MessagingTopicManagementResponse
 */
const batchUnsubscribeTokensFromTopic = async (tokensArray: string[]) => {
    const messaging = initializedFirebaseAdmin.messaging();
    // The unsubscribe operation is async and returns a promise.
    const unsubscribePromises = tokensArray.map(token => messaging.unsubscribeFromTopic(token, liveStreamTopicString));

    return Promise.all(unsubscribePromises);
}

/**
 * 
 * @param {admin.firestore.DocumentReference<admin.firestore.DocumentData>[]} refrenceArray This is an array of the document references to be deleted
 * @returns {Promise<admin.firestore.WriteResult>[]} This is a promise that resolves to an array of the admin.firestore.WriteResult
 */
const batchDeleteInvalidTokens = async (refrenceArray: admin.firestore.DocumentReference<admin.firestore.DocumentData>[]) => {
    const massDeleteRferences = refrenceArray.map(docRef => docRef.delete());

    return Promise.all(massDeleteRferences);
}


export const sendLiveStreamNotification = firebaseFunctions.firestore.document(`${livestreamCollectionString}/${liveStreamDocumentString}`)
    .onUpdate(
        async (change) => {

            try {
                const newData = change.after.data()
                let message;

                if (newData.streamingOn !== "none") {
                    message = {
                        topic: liveStreamTopicString,
                        notification: {
                            title: "Hx is live!",
                            body: `Hx is now live on ${newData.streamingOn}!`
                        }
                    };
                } else {
                    message = {
                        topic: liveStreamTopicString,
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

export const unsubscribeAndDeleteInvalidTokens = firebaseFunctions.pubsub.schedule('0 0 * * 0').onRun(async (context) => {
    try {
        const fcmDetailsCollection = initializedFirebaseAdmin.firestore().collection(fcmDetailsCollectionString);
        const sixtyDaysInSeconds = 60 * 60 * 24 * 60;
        const currentTime = admin.firestore.Timestamp.now();
        const cutOffTimeOf2Months = new admin.firestore.Timestamp(currentTime.seconds - sixtyDaysInSeconds, 0)

        const query = fcmDetailsCollection.where('messagelastreceivedon', '<', cutOffTimeOf2Months).where('messagelastreceivedon', '==', cutOffTimeOf2Months);

        query.get().then(async (querySnapshot) => {
            if (!querySnapshot.empty) {
                const arrayOfInvalidatedTokens = querySnapshot.docs.map(doc => doc.data().token)
                const arrayOfInvalidatedTokensReferences = querySnapshot.docs.map(doc => doc.ref)

                if (arrayOfInvalidatedTokens.length > 0 && arrayOfInvalidatedTokensReferences.length > 0) {
                    await batchUnsubscribeTokensFromTopic(arrayOfInvalidatedTokens);
                    await batchDeleteInvalidTokens(arrayOfInvalidatedTokensReferences);

                    console.log("Successfully unsubscribed and deleted invalid tokens")
                } else {
                    console.log("No invalid tokens found")
                }

            }
        })
    } catch (error) {
        console.error("Failed to batch delete and unsubscribe invalid tokens", error)
    }

})

