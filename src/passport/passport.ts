//Types
import { VerifyFunction } from 'passport-local';

//Functions
import { getClient } from '../db/db';

//Utilities
import { comparePassword } from '../utils/cryptoHash';

//Interfaces
import { userDocument } from '../interfaces/interface';

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const passport = require('passport');
var LocalStrategy = require('passport-local');
const dotenv = require('dotenv');

// Load variables from .env into memory
dotenv.config();

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY
}

export const verifyUser = () => {
    console.log("Verifying user")

    passport.use(new LocalStrategy(
        async function verify(username: string, password: string, cb: Function) {
            try {
                console.log("Running verify function")
                const { client, collection } = (await getClient(process.env.MONGO_DB_URI as string))
                const db = collection.collection(process.env.DB_MOD_COLLECTION as string)
                let user = await db.findOne({ username: username }) as userDocument

                await client.close()

                if (!user) {
                    return cb(null, false, { message: "User not found" })
                }

                let doPasswordsMatch = await comparePassword(password, user.password)

                if (!doPasswordsMatch) {
                    console.log("Passwords do not match")
                    return cb(null, false, { message: "Incorrect password" })
                }

                if (doPasswordsMatch) {
                    console.log("Passwords match")
                    return cb(null, user)
                }


            } catch (e) {
                console.error("Failed to get DB")
                return cb(e, false, { message: "Failed to get DB" })
            }
        }))
}

export const verifyJWT = () => {
    passport.use(new JwtStrategy(jwtOptions, async (payload: any, cb: Function) => {

        try {
            const { client, collection } = (await getClient(process.env.MONGO_DB_URI as string))

            let db = collection.collection(process.env.DB_MOD_COLLECTION as string)
            let user = await db.findOne({ username: payload.username }) as userDocument

            await client.close()

            if (!user) {
                return cb(null, false, { message: "User not found" })
            }

            if (user) {
                console.log("User's token is valid")
                return cb(null, user)
            }

        } catch (e) {
            console.error("Failed to verify JWT")
            cb(e, false, { message: "Failed to verify JWT" })
        }
    }))
}
