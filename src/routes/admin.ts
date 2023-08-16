//dotenv
import dotenv from 'dotenv';

//Types
import { Request, Response, response } from 'express';

//Utils
import { sendResponse } from '../utils/sendresponse';

//Passport
import { verifyJWT } from '../passport/passport';
import passport from 'passport';

//Express
import express from 'express';

//Firestore
import { db as firebaseDB } from '../db/firestore'

//Import express-validator functions
import { validationResult, matchedData } from 'express-validator';

//Validator Schema
import { updateLiveStreamSchema, updateNameSkitSchema, updateOmegleStreamSchema } from '../schemas/validatorschemas';

//Interfaces
import { liveStreamDocument, rawOmegleTagsData, omegleTagsDocument } from '../interfaces/interface';

//Utils
import { sendSseEvent } from '../utils/sse';

//Invoke Verify JWT for verifying the user's JWT
verifyJWT()

//Load variables from .env into memory
dotenv.config();

export const adminRouter = express.Router();

const adminSseClients: Response[] = []

adminRouter.get('/sse/subscribe', (req: Request, res: Response) => {
    //Set headers for the SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    //Send something to establish connection
    res.write('data: {\"trigger\":\"init\"}\n\n');

    //Add the response to the array of clients
    adminSseClients.push(res)

    //Remove the response from the array of clients when the client closes the connection
    req.on('close', () => {
        const indexOfDisconnectedClient = adminSseClients.indexOf(res)
        if (indexOfDisconnectedClient != -1) {
            adminSseClients.splice(indexOfDisconnectedClient, 1)
        }
    })
})

/**
 * This route is expecting streamingOn (e.g. Youtube), streamLink (optional), 
 * and activityType (e.g nameskit or raid)
 */
adminRouter.post('/livestream/update',
    passport.authenticate('jwt', { session: false }),
    updateLiveStreamSchema,
    (req: Request, res: Response) => {

        const result = validationResult(req);

        if (!result.isEmpty()) {
            sendResponse.badRequest(res, "Error", 400, { ...result.array() })
        }

        if (result.isEmpty()) {
            const { streamingOn, streamingLink = "none", activityType } = matchedData(req)

            //If Hx is not streaming on youtube or twitch and the streaming link is not set, update the livestream
            if ((streamingOn === "none"
                && streamingLink === "none"
                && activityType === "none")) {
                const livestreamCollection = firebaseDB.collection(process.env.DB_LIVESTREAM_COLLECTION as string)
                const livestreamMasterDocument = livestreamCollection.doc(process.env.DB_LIVESTREAM_DOCUMENT_ID as string)

                let newLivestreamData: liveStreamDocument = {
                    streamingOn: streamingOn,
                    streamingLink: streamingLink,
                    activityType: activityType
                }

                livestreamMasterDocument.update({ ...newLivestreamData }).then(
                    () => {
                        console.log("Successfully set Hx top 'no longer streaming'")
                        sendSseEvent("livestreamUpdate", adminSseClients, { ...newLivestreamData })
                        sendResponse.success(res, "Success", 200)
                    }
                ).catch((error) => {
                    sendResponse.internalError(res, "Failed to update livestream", 500)
                })
            } else if (streamingOn === "none" && (streamingLink !== "none" || activityType !== "none")) {

                let errorMessage: { [key: string]: string | undefined } = { streamingLinkError: undefined, activityTypeError: undefined }
                if (streamingLink !== "none") {
                    errorMessage.streamingLinkError = "If Hyphonix is not currently streaming, please set the streaming link to 'none'"
                }

                if (activityType !== "none") {
                    errorMessage.activityTypeError = "If Hyphonix is not currently streaming, please set the activity type to 'none'"
                }

                sendResponse.badRequest(res, "Error", 400, { ...errorMessage })

            }

            //If Hx is streaming on youtube or twitch and the streaming link is set, update the livestream
            if ((streamingOn === "youtube" || streamingOn === "twitch")
                && streamingLink !== "none") {
                const livestreamCollection = firebaseDB.collection(process.env.DB_LIVESTREAM_COLLECTION as string)
                const livestreamMasterDocument = livestreamCollection.doc(process.env.DB_LIVESTREAM_DOCUMENT_ID as string)
                let newLivestreamData: liveStreamDocument = {
                    streamingOn: streamingOn,
                    streamingLink: streamingLink,
                    activityType: activityType
                }
                livestreamMasterDocument.update({ ...newLivestreamData }).then(
                    () => {
                        console.log("Successfully updated livestream")
                        sendSseEvent("livestreamUpdate", adminSseClients, { ...newLivestreamData })
                        sendResponse.success(res, "Success", 200)
                    }
                ).catch((error) => {
                    console.error("Failed to update livestream", error)
                    sendResponse.internalError(res, "Failed to update livestream", 500)
                })

            } else {
                //If Hx is not streaming on youtube or twitch and the streaming link is not set, don't update the livestream
                if (streamingOn === "youtube") {
                    sendResponse.badRequest(res, "If Hyphonix is currently streaming on youtube, please set a youtube streaming link", 400)
                }

                if (streamingOn === "twitch") {
                    sendResponse.badRequest(res, "If Hyphonix is currently streaming on twitch, please set a twitch streaming link", 400)
                }
            }

        }

    })
/**
 * This route is used to update the name of the person being trolled as well as 
 * whether or not the person being trolled should be gaslit
 */

adminRouter.post('/nameskit/update',
    passport.authenticate('jwt', { session: false }),
    updateNameSkitSchema,
    (req: Request, res: Response) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            sendResponse.badRequest(res, "Error", 400, { ...result.array() })
        } else {
            const marksName = matchedData(req).marksName
            const shouldUserBeGaslit = JSON.parse(matchedData(req).shouldUserBeGaslit)

            const nameskitCollection = firebaseDB.collection(process.env.DB_NAMESKIT_COLLECTION as string)
            const nameSkitDocument = nameskitCollection.doc(process.env.DB_NAMESKIT_DOCUMENT_ID as string)

            const newNameskitData = {
                marksName,
                shouldUserBeGaslit
            }

            nameSkitDocument.update({ ...newNameskitData }).then(
                () => {
                    sendSseEvent("nameskitUpdate", adminSseClients, { ...newNameskitData })
                    console.log("Successfully updated nameskit")
                    sendResponse.success(res, "Success", 200)
                }
            ).catch((error) => {
                console.error("Failed to update nameskit", error)
                sendResponse.internalError(res, "Failed to update nameskit", 500)
            })
        }
    })

adminRouter.post('/omegletags/update',
    passport.authenticate('jwt', { session: false }),
    updateOmegleStreamSchema,
    async (req: Request, res: Response) => {

        const result = validationResult(req);

        if (!result.isEmpty()) {
            sendResponse.badRequest(res, "Error", 400, { ...result.array() })
        } else if (result.isEmpty()) {

            let { currentOmegleTags } = matchedData(req)
            const omegleTagsCollection = firebaseDB.collection(process.env.DB_OMEGLE_COLLECTION as string)
            const omegleTagMasterDocument = omegleTagsCollection.doc(process.env.DB_OMEGLE_DOCUMENT_ID as string)

            let dbOmegleData: omegleTagsDocument | false = await omegleTagMasterDocument.get().then(
                (snapshot) => {
                    if (snapshot.exists) {
                        return snapshot.data() as omegleTagsDocument
                    } else {
                        return false
                    }
                }
            )

            if (dbOmegleData) {

                let mergedOmegleTags: string[] = [...dbOmegleData.currentOmegleTags]

                //Ensure that only new tags are added to the database
                for (let i = 0; i < currentOmegleTags.length; i++) {
                    if (!dbOmegleData.currentOmegleTags.includes(currentOmegleTags[i])) {
                        mergedOmegleTags.push(currentOmegleTags[i])
                    }
                }

                omegleTagMasterDocument.update({ currentOmegleTags: mergedOmegleTags }).then(
                    (response) => {
                        sendSseEvent("omegletagsUpdate", adminSseClients, { currentOmegleTags: mergedOmegleTags })
                        console.log("Successfully updated omegle tags")
                        sendResponse.success(res, "Updated Omegle Tags", 200, mergedOmegleTags)
                    }
                ).catch(error => sendResponse.badRequest(res, "Failed to update omegle tags", 400))
            } else {
                sendResponse.internalError(res, "Failed to get omegle tags", 500)
            }
        }


    })

adminRouter.get('/omegletags/reset',
    passport.authenticate('jwt', { session: false }),
    (req: Request, res: Response) => {
        const omegleTagsCollection = firebaseDB.collection(process.env.DB_OMEGLE_COLLECTION as string)
        const omegleTagMasterDocument = omegleTagsCollection.doc(process.env.DB_OMEGLE_DOCUMENT_ID as string)

        omegleTagMasterDocument.update({ currentOmegleTags: [] }).then(
            (response) => {
                sendSseEvent("omegletagsUpdate", adminSseClients, { currentOmegleTags: [] })
                console.log("Successfully reset omegle tags")
                sendResponse.success(res, "Reset Omegle Tags", 200)
            }
        ).catch((error) => {
            console.error("Failed to reset omegle tags", error)
            sendResponse.internalError(res, "Failed to reset omegle tags", 500)
        })
    })