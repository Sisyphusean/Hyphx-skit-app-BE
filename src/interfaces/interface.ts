import { ObjectId } from "mongodb"

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