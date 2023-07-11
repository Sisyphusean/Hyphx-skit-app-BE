//dotenv
import dotenv from 'dotenv';

//Types
import { Request, Response, response } from 'express';

//Utils
import { sendResponse } from '../utils/sendresponse';

//Express
import express from 'express';

//Firestore
import { db as firebaseDB } from '../db/firestore'

//Interfaces
import { liveStreamDocument, rawOmegleTagsData, omegleTagsDocument } from '../interfaces/interface';

//Load variables from .env into memory
dotenv.config();

export const userRouter = express.Router();

userRouter.get('/livestream/get', (req: Request, res: Response) => {
    const livestreamCollection = firebaseDB.collection(process.env.DB_LIVESTREAM_COLLECTION as string)
    const livestreamMasterDocument = livestreamCollection.doc(process.env.DB_LIVESTREAM_DOCUMENT_ID as string)

    livestreamMasterDocument.get().then(
        (snapshot) => {
            if (snapshot.exists) {
                const livestreamData = snapshot.data() as liveStreamDocument
                sendResponse.success(res, "Success", 200, { ...livestreamData })
            } else {
                sendResponse.notFound(res, "Livestream not found", 404)
            }
        }
    ).catch((error) => {
        console.error("Failed to get livestream", error)
    })
})

userRouter.get('/omegletags/get', (req: Request, res: Response) => {
    const omegleTagsCollection = firebaseDB.collection(process.env.DB_OMEGLE_COLLECTION as string)
    const omegleTagMasterDocument = omegleTagsCollection.doc(process.env.DB_OMEGLE_DOCUMENT_ID as string)

    omegleTagMasterDocument.get().then(
        (snapshot) => {
            if (snapshot.exists) {
                const omegleTagsData = snapshot.data() as rawOmegleTagsData
                sendResponse.success(res, "Success", 200, { ...omegleTagsData })
            } else {
                sendResponse.notFound(res, "Omegle tags not found", 404)
            }
        }
    ).catch((error) => {
        console.error("Failed to get omegle tags", error)
    })
})