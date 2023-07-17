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
import { liveStreamDocument, rawOmegleTagsData, omegleTagsDocument, rawNameSkitData } from '../interfaces/interface';

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
        sendResponse.internalError(res, "Failed to get Omegle tags", 500)
    })
})

userRouter.get('/nameskit/get', (req: Request, res: Response) => {
    const nameSkitCollection = firebaseDB.collection(process.env.DB_NAMESKIT_COLLECTION as string)
    const nameSkitMasterDocument = nameSkitCollection.doc(process.env.DB_NAMESKIT_DOCUMENT_ID as string)

    nameSkitMasterDocument.get().then(
        (snapshot) => {
            if(snapshot.exists) {
                const nameSkitData = snapshot.data() as rawNameSkitData
                sendResponse.success(res, "Success", 200, { ...nameSkitData })
            }else {
                sendResponse.notFound(res, "Name skit not found", 404)
            }
        }
    ).catch((error) => {
        console.error("Failed to get name skit", error)
        sendResponse.internalError(res, "Failed to get name skit", 500)
    })
})