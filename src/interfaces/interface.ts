import { ObjectId } from "mongodb"

export interface responseFormat {
    status: number,
    message: "Success",
    data: Object
}

export interface userDocument {
    _id: ObjectId | undefined,
    username: string,
    password: string
}