import { Express, Request, Response } from 'express';

//Utils
import { startSever } from './utils/startserver';
import { sendReponse } from './utils/sendresponse';

//Constants
import { devCorsSetup, prodAndStagingCorsSetup } from './constants/cors';

const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const app: Express = express();

// Load variables from .env into memory
dotenv.config();

const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;

//Instantiate cors
app.use(cors(environment === 'development' ? devCorsSetup : prodAndStagingCorsSetup))

startSever(port, environment, app)

app.get('/', (req: Request, res: Response) => {
    sendReponse.success(res, "Success")
});




