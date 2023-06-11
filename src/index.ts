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
const { createProxyMiddleware } = require('http-proxy-middleware');

// Load variables from .env into memory
dotenv.config();

const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;
const dbUri = process.env.MONGO_DB_URI as string;
const proxyOptions = {
    target: 'http://proxy:c619a76cc1f24affa2c2b77f6afa4594@proxy-54-83-52-155.proximo.io',
    changeOrigin: true,
    pathRewrite: {
        '^/test': '/endpoint', // Replace /endpoint with the actual endpoint path
    },
    headers: {
        'Proxy-Authorization': `Basic ${Buffer.from("c619a76cc1f24affa2c2b77f6afa4594").toString('base64')}`,
    },
};
//Instantiate cors
app.use(cors(environment === 'development' ? devCorsSetup : prodAndStagingCorsSetup))

//Add JSON to Body
app.use(express.json());

startSever(port, environment, app)

app.get('/test',
    createProxyMiddleware(proxyOptions),
    async (req: Request, res: Response) => {
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





