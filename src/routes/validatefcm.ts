//Express
import express, { Request, Response } from 'express'

//Dotenv
import dotenv from 'dotenv';

//ValidatorSchema
import { saveFcmTokenSchema, validateFcmTokenSchema, updateFcmTokenSchema } from '../schemas/validatorschemas';

//Response handlers
import { sendResponse } from '../utils/sendresponse';

//Express Validator
import { validationResult } from 'express-validator';

//Firestore
import { initializedFirebaseAdmin as firebaseAdmin } from '../db/firestore'
import { db as firebaseDB } from '../db/firestore'

//Interfaces
import { fcmClientDocument, fcmClientDocumentWithId } from '../interfaces/interface'

// Load variables from .env into memory
dotenv.config();

export const validateFCMRouter = express.Router();

const fcmDetailsCollection = firebaseDB.collection(process.env.DB_FCM_COLLECTION as string)

const nameSkitTopic = process.env.FIREBASE_NAMESKIT_TOPIC as string
const livestreamTopic = process.env.FIREBASE_LIVESTREAM_TOPIC as string
const omegleTopic = process.env.FIREBASE_OMEGLE_TOPIC as string

const isTokensTimeStillValid = (messageLastReceived: Date) => {
    const currentDate = new Date()
    const timeDiffInMilliseconds = currentDate.getTime() - messageLastReceived.getTime();
    const timeDiffInMonths = timeDiffInMilliseconds / (1000 * 60 * 60 * 24 * 30)

    if (timeDiffInMonths >= 2) {
        return false
    }

    return true

}

const getTokenData = async (token: string, dateVersionOfMessageLastRevceived: Date | undefined = undefined) => {

    const query = await fcmDetailsCollection.where('token', '==', token).limit(1)

    let wasTokenReturned = false
    let fcmData: fcmClientDocumentWithId = { id: "", token: "", platform: "", addedOn: new Date(), messagelastreceivedon: new Date(), subscribedTo: [] }

    await query.get().then(
        (querySnapshot) => {

            if (!querySnapshot.empty) {

                querySnapshot.forEach(
                    async (doc) => {

                        const data = await doc.data()
                        // console.log(data)
                        const platform = data.platform
                        const addedon = data.addedOn.toDate()
                        const messagelastreceivedon = dateVersionOfMessageLastRevceived ? dateVersionOfMessageLastRevceived : data.messagelastreceivedon.toDate()
                        const subscribedTo = data.subscribedTo
                        const id = doc.id
                        wasTokenReturned = true
                        fcmData = { id, token, platform, addedOn: addedon, messagelastreceivedon, subscribedTo }

                        // console.log(fcmData)

                    })
            } else {
                console.log("Token not found")
            }

        }
    )

    return { wasTokenReturned, fcmData }
}

const subscribeTokenToTopics = async (token: string) => {
    try {
        await Promise.all([
            firebaseAdmin.messaging().subscribeToTopic(token, livestreamTopic),
            firebaseAdmin.messaging().subscribeToTopic(token, nameSkitTopic),
            firebaseAdmin.messaging().subscribeToTopic(token, omegleTopic)
        ]);
        return true;
    } catch (error) {
        console.error('Failed to subscribe user to topics:', error);
        return false;
    }
};

const unSubscribeTokenFromTopics = async (token: string) => {
    try {
        await Promise.all([
            firebaseAdmin.messaging().unsubscribeFromTopic(token, livestreamTopic),
            firebaseAdmin.messaging().unsubscribeFromTopic(token, nameSkitTopic),
            firebaseAdmin.messaging().unsubscribeFromTopic(token, omegleTopic)
        ]);
        return true;
    } catch (error) {
        console.error('Failed to unsubscribe user to topics:', error);
        return false;
    }
};

const deleteToken = async (token: string) => {
    const query = await fcmDetailsCollection.where('token', '==', token).limit(1)
    let didDeletionOccur = false

    await query.get().then(
        async (querySnapshot) => {
            if (!querySnapshot.empty) {

                const deletionPromises = querySnapshot.docs.map(async (doc) => {
                    if (doc.exists) {
                        let isUserUnsubscribedFromTopics = await unSubscribeTokenFromTopics(token)

                        if (isUserUnsubscribedFromTopics) {
                            doc.ref.delete()
                            return true
                        } else {
                            return false
                        }
                    }

                    return false
                })

                await Promise.all(deletionPromises).then(
                    (resolve) => {
                        didDeletionOccur = true
                    },

                    (reject) => {
                        didDeletionOccur = false
                    }
                )

            } else {
                console.log("Token not found")
            }
        }
    ).catch((error) => {
        console.error("Failed to delete token", error)
        return didDeletionOccur
    })

    return didDeletionOccur

}

validateFCMRouter.post('/updatelastmessageon',
    updateFcmTokenSchema,
    async (req: Request, res: Response) => {

        const result = validationResult(req)

        if (result.isEmpty()) {

            const token = req.body.token

            const newMessageLastReceivedOn: Date = new Date(req.body.messagelastreceivedon)

            let tokenData = await getTokenData(token, newMessageLastReceivedOn)

            if (tokenData.wasTokenReturned) {
                let masterTokenDocument = fcmDetailsCollection.doc(tokenData.fcmData.id as string)

                const newTokenDocument: fcmClientDocument = {
                    token: token,
                    platform: tokenData.fcmData.platform,
                    addedOn: tokenData.fcmData.addedOn,
                    messagelastreceivedon: newMessageLastReceivedOn,
                    subscribedTo: tokenData.fcmData.subscribedTo
                }

                await masterTokenDocument.update({ ...newTokenDocument }).then(
                    () => {
                        console.log("Updated last message received on for token")
                        sendResponse.success(res, "Updated last message received on for token", 200, { ...newTokenDocument })
                    }
                ).catch((error) => {
                    console.error("Failed to update last message received on for token", error)
                    sendResponse.internalError(res, "Failed to update last message received on for token", 500)
                })
            } else {
                sendResponse.notFound(res, "Token not found", 404)
            }

        }

        if (!result.isEmpty()) {
            sendResponse.badRequest(res, "Error", 400, { ...result.array() })
        }

    })

validateFCMRouter.post('/validatetoken',
    validateFcmTokenSchema,
    async (req: Request, res: Response) => {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            sendResponse.badRequest(res, "Error", 400, { ...result.array() })
        }

        if (result.isEmpty()) {
            const { token } = req.body
            const tokenData = await getTokenData(token)

            if (tokenData.wasTokenReturned) {
                const isTokenValid = isTokensTimeStillValid(tokenData.fcmData.messagelastreceivedon)

                if (!isTokenValid) {
                    await deleteToken(tokenData.fcmData.token).then(
                        (resolve) => {
                            sendResponse.accepted(res, "Token invalidated successfully", 202, { isTokenValid: false })
                        },

                        (reject) => {
                            sendResponse.internalError(res, "Failed to invalidate token", 500)
                        }


                    )
                }

                if (isTokenValid) {
                    sendResponse.success(res, "Token is valid", 200, { isTokenValid: true })
                }
            }

            if (!tokenData.wasTokenReturned) {
                sendResponse.notFound(res, "Token not found", 404)
            }

        }
    })

validateFCMRouter.post('/savetoken',
    saveFcmTokenSchema,
    async (req: Request, res: Response) => {

        const result = validationResult(req)


        if (!result.isEmpty()) {
            sendResponse.badRequest(res, "Error", 400, { ...result.array() })
        }

        if (result.isEmpty()) {
            const { token, platform } = req.body
            const tokenData = await getTokenData(token)

            if (tokenData.wasTokenReturned) {
                sendResponse.conflict(res, "Token already exists", 409, { ...tokenData.fcmData })
            }

            if (!tokenData.wasTokenReturned) {
                const newClientsFcmDoc = fcmDetailsCollection.doc()
                const newClientsFcmDocId = newClientsFcmDoc.id
                let hasUserSubscribedToTokens = await subscribeTokenToTopics(token)

                if (!hasUserSubscribedToTokens) {
                    sendResponse.internalError(res, "Failed to subscribe user to topics", 500)
                }

                if (hasUserSubscribedToTokens) {
                    const newClientsFcmDocData: fcmClientDocument = {
                        token: token,
                        platform: platform,
                        addedOn: new Date(),
                        messagelastreceivedon: new Date(),
                        subscribedTo: ["nameskit", "livestream", "omegle"]
                    }

                    newClientsFcmDoc.set(newClientsFcmDocData).then(
                        () => {
                            console.log("New client added to FCM collection")
                            sendResponse.success(res, "New client added to FCM collection", 200, { ...newClientsFcmDocData, id: newClientsFcmDocId })
                        }
                    ).catch((error) => {
                        console.log("Error adding new client to FCM collection: " + error)
                        sendResponse.internalError(res, "Error adding new client to FCM collection", 500)
                    })
                }


            }

        }

    })