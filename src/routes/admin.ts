//dotenv
import dotenv from 'dotenv';

//Types
import { Request, Response } from 'express';

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
import { updateLiveStreamSchema } from '../schemas/validatorschemas';

//Interfaces
import { liveStreamDocument } from '../interfaces/interface';

//Invoke Verify JWT for verifying the user's JWT
verifyJWT()

//Load variables from .env into memory
dotenv.config();

export const adminRouter = express.Router();

adminRouter.use('/', passport.authenticate('jwt', { session: false }))

/**
 * This route is expecting streamingOn (e.g. Youtube), streamLink (optional), 
 * and activityType (e.g nameskit or raid)
 */
adminRouter.post('/livestream/update',
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