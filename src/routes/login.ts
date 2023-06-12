//Types
import { Request, Response } from 'express';

//Utils
import { sendReponse } from '../utils/sendresponse';

//Passport
import { verifyUser } from '../passport/passport';
import passport from 'passport';

//JWT
import { generateToken } from '../utils/jwt';

//Express
import express from 'express';

//Interfaces
import { userDocument } from '../interfaces/interface';

//Invoke Passport setup
verifyUser()

const loginRouter = express.Router();

loginRouter.get('/saveUser', (req: Request, res: Response) => {

})

loginRouter.post('/password', (req: Request, res: Response, next) => {
    passport.authenticate('local', { session: false }, (error: Error | null, user: userDocument, info: { message: string }) => {
        console.log(JSON.stringify(error))
        if (error) {
            return next(error)
        }

        if (!user) {
            sendReponse.badRequest(res, "Failed to verify user", 400)
        }

        if (user) {
            const token = generateToken(user as userDocument)
            const data = {
                id: user._id,
                username: user.username,
                token: token
            }
            sendReponse.success(res, "User successfully authenticated", 200, { ...data })
        }
    })(req, res, next);
})

module.exports = loginRouter 