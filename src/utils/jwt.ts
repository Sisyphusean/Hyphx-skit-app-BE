//JWT
import jwt from 'jsonwebtoken';

//Interfaces
import { userDocument } from '../interfaces/interface';

const dotenv = require('dotenv');

// Load variables from .env into memory
dotenv.config();

export const generateToken = (user: userDocument) => {
    const payload = {
        id: user._id,
        username: user.username,
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY as string,
        {
            expiresIn: '24h'
        }
    )

    return token
}