//Types
import { VerifyFunction } from 'passport-local';

//Functions
import { getClient } from '../db/db';

//Utilities
import { comparePassword } from '../utils/cryptoHash';

//Interfaces
import { userDocument } from '../interfaces/interface';

//Firebase
import { db as firebaseDB, terminateFirebase, querySnapshot } from '../db/firestore';

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

    passport.use(new LocalStrategy(
        async function verify(username: string, enteredPassword: string, cb: Function) {
            try {
                console.log("Running verify function")
                const modCollectionRef = firebaseDB.collection(process.env.DB_MOD_COLLECTION as string)
                let query = await modCollectionRef.where('username', '==', username).limit(1)

                query.get().then(async (querySnapshot: querySnapshot) => {
                    if (querySnapshot.empty) {
                        return cb(null, false, { message: "User does not exist" })
                    } else {
                        querySnapshot.forEach(async (doc) => {
                            if (doc.exists) {
                                const { username, password } = doc.data()
                                const user = { username, password }
                                let doPasswordsMatch = await comparePassword(enteredPassword, password)

                                if (!doPasswordsMatch) {
                                    console.log("Incorrect password")
                                    return cb(null, false, { message: "Incorrect password" })
                                }


                                if (doPasswordsMatch) {
                                    console.log("Passwords match", JSON.stringify(user))
                                    return cb(null, user)
                                }

                            } else {
                                return cb(null, false, { message: "User does not exist" })
                            }
                        })
                    }
                })

                terminateFirebase()
            } catch (e) {
                console.error("Failed to get DB")
                return cb(e, false, { message: "Failed to get DB" })
            }
        }))
}

export const verifyJWT = () => {
    passport.use(new JwtStrategy(jwtOptions, async (payload: any, cb: Function) => {

        try {
            const modCollectionRef = firebaseDB.collection(process.env.DB_MOD_COLLECTION as string)
            let query = await modCollectionRef.where('username', '==', payload.username).limit(1)

            query.get().then(async (querySnapshot: querySnapshot) => {
                if (querySnapshot.empty) {
                    console.log("Token Invalid")
                    return cb(null, false, { message: "User Token invalid" })
                } else {
                    querySnapshot.forEach(async (doc) => {
                        if (doc.exists) {
                            const { username } = doc.data()
                            const user = { username }
                            console.log("User's token is valid")
                            return cb(null, user)
                        } else {
                            console.log("Token Invalid")
                            return cb(false, { message: "User Token invalid" })
                        }
                    })
                }
            })

        } catch (e) {
            console.error("Failed to verify JWT")
            cb(e, false, { message: "Failed to verify JWT" })
        }
    }))
}
