import { Express, Request, Response } from 'express';

//Utils
import { startSever } from './utils/startserver';
import { sendReponse } from './utils/sendresponse';

const express = require('express');
const dotenv = require('dotenv');
const app: Express = express();

// Load variables from .env into memory
dotenv.config();

const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;

startSever(port, environment, app)

app.get('/', (req: Request, res: Response) => {
    sendReponse.forbidden(res)
});




