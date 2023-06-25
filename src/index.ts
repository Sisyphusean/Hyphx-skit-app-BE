//Dotenv
import dotenv from 'dotenv';

// Load variables from .env into memory
dotenv.config();

//Express
import { Express, Request, Response, NextFunction } from 'express';

//Types
import { HttpError } from 'http-errors';

//JSON Handler
import bodyParser from 'body-parser';

//Utils
import { startSever } from './utils/startserver';
import { sendResponse } from './utils/sendresponse'

//Constants
import { devCorsSetup, prodAndStagingCorsSetup } from './constants/cors';

//Routes
import { adminRouter } from './routes/admin';

//Passport
import { verifyUser } from './passport/passport';
import passport from 'passport';
var LocalStrategy = require('passport-local');

// Register the 'local' strategy with Passport
passport.use(new LocalStrategy(verifyUser));

const express = require('express');
const cors = require('cors')
const app: Express = express();
const morgan = require('morgan');
const loginRouter = require('./routes/login');


const port = process.env.PORT;
const environment = process.env.ENVIRONMENT;

// Initialize and use Passport middleware
app.use(passport.initialize());

//add morgan to log HTTP requests
app.use(morgan('dev'));

//Instantiate cors
app.use(cors(environment === 'development' ? devCorsSetup : prodAndStagingCorsSetup))

console.log("Environment: " + environment)

//Add JSON to Body
app.use(bodyParser.json({ strict: true }));

//Handle Malformed JSONs
app.use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
    if (err instanceof SyntaxError && err.statusCode === 400 && 'body' in err) {
        sendResponse.badRequest(res, "Invalid JSON format", 400)
    } else {
        next();
    }
});

startSever(port, environment, app)

app.use('/login', loginRouter);
app.use('/admin', adminRouter)

app.get('/', (req: Request, res: Response) => {
    sendResponse.success(res, "Success")
});

//404
app.use((req: Request, res: Response) => {
    sendResponse.notFound(res, "Not Found")
});





