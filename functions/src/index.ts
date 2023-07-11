import * as firebaseFunctions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface notificationMessage {
    topic: string,
    notification: {
        title: string,
        body: string
    },
    data?: any
}

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

const omegleDetailsCollectionString = firebaseFunctions.config().db.omegle_details_collection as string;
const omegleDocumentString = firebaseFunctions.config().db.omegle_details_document_id as string
const omegleTopic = firebaseFunctions.config().topics.omegle_topic as string;


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

const generateYoutubeNotificationMessage = (newData: any, dataToBeIncluded: any): notificationMessage | boolean => {

    let message: notificationMessage

    if (newData.streamingOn === "youtube" && newData.activityType === "nameskit") {
        message = {
            topic: liveStreamTopicString,
            notification: {
                title: "Come join Hx's name skit event 🎭!",
                body: `Hx is now live on ${newData.streamingOn} and running a community event. Come participate and join the fun`
            },
            data: dataToBeIncluded
        };

        return message;
    }

    if (newData.streamingOn === "youtube" && newData.activityType === "none") {
        message = {
            topic: liveStreamTopicString,
            notification: {
                title: "Hyphonix is live on Yotube▶️!",
                body: `Hx is now live on ${newData.streamingOn}! Come join the fun`
            },
            data: dataToBeIncluded
        };

        return message;
    }

    if (newData.streamingOn === "youtube" && newData.activityType === "raid") {
        message = {
            topic: liveStreamTopicString,
            notification: {
                title: "Hx is streaming Raid Shadow Legends👾🧙🏾!",
                body: `Hx is now live on ${newData.streamingOn} streaming Raid Shadow Legends! Come watch the stream and join the fun`
            },
            data: dataToBeIncluded
        };

        return message;
    }

    return false
}

const generateTwitchNotificationMessage = (newData: any, dataToBeIncluded: any): notificationMessage | boolean => {

    let message: notificationMessage

    if (newData.streamingOn === "twitch" && newData.activityType === "nameskit") {
        message = {
            topic: liveStreamTopicString,
            notification: {
                title: "Come join Hx's name skit event 🎭!",
                body: `Hx is now live on ${newData.streamingOn} and running a community event. Come participate and join the fun`
            },
            data: dataToBeIncluded
        };

        return message;
    }

    if (newData.streamingOn === "twitch" && newData.activityType === "none") {
        message = {
            topic: liveStreamTopicString,
            notification: {
                title: "Hyphonix is live on Twitch!",
                body: `Hx is now live on ${newData.streamingOn}! Come join the fun`
            },
            data: dataToBeIncluded
        };

        return message;
    }

    if (newData.streamingOn === "twitch" && newData.activityType === "raid") {
        message = {
            topic: liveStreamTopicString,
            notification: {
                title: "Hx is streaming Raid Shadow Legends👾🧙🏾!",
                body: `Hx is now live on ${newData.streamingOn} streaming Raid Shadow Legends! Come watch the stream and join the fun`
            },
            data: dataToBeIncluded
        };

        return message;
    }

    return false;
}

export const sendLiveStreamNotification = firebaseFunctions.firestore.document(`${livestreamCollectionString}/${liveStreamDocumentString}`)
    .onUpdate(
        async (change) => {

            try {
                const newData = change.after.data()
                const dataToBeIncluded = {
                    messageFromEvent: "liveStreamUpdate",
                    streamingOn: newData.streamingOn,
                    activityType: newData.activityType,
                    streamingLink: newData.streamingLink
                }
                let message: notificationMessage | boolean = false;

                if (newData.streamingOn !== "none") {

                    if (newData.streamingOn === "youtube") {
                        message = generateYoutubeNotificationMessage(newData, dataToBeIncluded);
                    }

                    if (newData.streamingOn === "twitch") {
                        message = generateTwitchNotificationMessage(newData, dataToBeIncluded);
                    }

                } else {
                    message = {
                        topic: liveStreamTopicString,
                        notification: {
                            title: "Hx is no longer live!😔",
                            body: `Hx's stream has ended. Don't worry, make sure to check back tomorrow. He streams live everyday!`
                        },
                        data: dataToBeIncluded
                    };
                }

                if (typeof message !== "boolean") {
                    await initializedFirebaseAdmin.messaging().send(message);
                    console.log("Successfully sent live notification");
                }
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

export const sendOmegleNotification = firebaseFunctions.firestore.document(`${omegleDetailsCollectionString}/${omegleDocumentString}`)
    .onUpdate(async (change) => {
        try {
            const updatedOmegleArray = change.after.data()
            const dataPayload = {
                messageFromEvent: "omegleUpdate",
                currentOmegleTags: updatedOmegleArray.currentOmegleTags.join(", ")
            }
            let message = {
                topic: omegleTopic,
                data: dataPayload
            }

            initializedFirebaseAdmin.messaging().send(message)
                .then(
                    (onFulfiled) => {
                        console.log("Successfully sent Omegle notification")
                    }
                ).catch(error => {
                    console.error("Failed to send Omegle notification", error)
                })

        } catch (error) {
            console.error("Failed to send Omegle notification", error)
        }
    })

