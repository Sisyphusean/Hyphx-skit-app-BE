import { Express, Request, Response } from 'express';

//Utils
import { startSever } from './utils/startserver';
import { sendReponse } from './utils/sendresponse';
import { consoleLog } from "./utils/consolelog";

//Constants
import { devCorsSetup, prodAndStagingCorsSetup } from './constants/cors';

//DB Connection
import { closeConn, getClient, listDatabases } from './db/db';


const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors')
const app: Express = express();

// Load variables from .env into memory
dotenv.config();

const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;
const dbUri = process.env.MONGO_DB_URI as string

//Instantiate cors
app.use(cors(environment === 'development' ? devCorsSetup : prodAndStagingCorsSetup))

//Add JSON to Body
app.use(express.json());

startSever(port, environment, app)

app.get('/test', async (req: Request, res: Response) => {
    try {
        const client = await getClient(dbUri)
        let retrievedDBs = await listDatabases(client)
        sendReponse.success(res, retrievedDBs)
    } catch (e) {
        console.error(e)
    }
    // closeConn(client)
})


app.get('/', (req: Request, res: Response) => {
    sendReponse.success(res, "Success")
});





