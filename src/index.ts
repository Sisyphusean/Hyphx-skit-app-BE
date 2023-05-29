import { Express, Request, Response } from 'express';

const express = require('express');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const fs = require('fs')

// Load variables from .env into memory
dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const options = {
    key: fs.readFileSync('./certs/selfsigned.key'),
    cert: fs.readFileSync("./certs/selfsigned.crt")
};

var httpServer = http.createServer(app);
// var httpsServer = https.createServer(options, app);

httpServer.listen(Number(process.env.PORT) + 1);
// httpsServer.listen(process.env.PORT);

app.get('/', (req: Request, res: Response) => {
    res.send('Hyphx Skit App API');
});




