//Types
import { Request, Response } from 'express';

//Utils
import { sendResponse } from '../utils/sendresponse';
import { youtubeRegex, twitchRegex } from '../constants/regex';

//Passport
import { verifyJWT } from '../passport/passport';
import passport from 'passport';

//Express
import express from 'express';

//Firebase
import * as admin from 'firebase-admin';

//Import express-validator functions
import { validationResult, matchedData } from 'express-validator';

//Validator Schema
import { updateLiveStreamSchema } from '../schemas/validatorschemas';

//Invoke Verify JWT for verifying the user's JWT
verifyJWT()

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
            const { streamingOn, streamingLink = null, activityType } = matchedData(req)

            if(streamingOn == "youtube") {
                
            }


            sendResponse.success(res, "Success", 200)
        }

    })