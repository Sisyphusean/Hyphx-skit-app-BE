import { ObjectId } from "mongodb"

//Types
import {subscribedTo} from './types'

export interface responseFormat {
    status: number,
    message: "Success",
    data: Object
}

export interface userDocument {
    id: ObjectId | undefined,
    username: string,
    password: string
}

export interface firebaseMessage {
    notification: {
        title: string,
        body: string,
    },
    data?: {
        [key: string]: string
    },
    topic: string
}

export interface liveStreamDocument {
    streamingOn: string,
    streamingLink: string,
    activityType: string
}

export interface fcmClientDocument {
    token: string,
    platform: string,
    addedOn: Date,
    messagelastreceivedon: Date,
    subscribedTo: subscribedTo
}

export interface fcmClientDocumentWithId extends fcmClientDocument {
    id: string
}