import { Express, Request, Response } from 'express';
import { startSever } from './utils/startserver';

const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs')
const app: Express = express();


// Load variables from .env into memory
dotenv.config();

const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;


startSever(port, environment, app)


app.get('/', (req: Request, res: Response) => {
    res.send('Hyphx Skit App API');
});




