import { Express, Request, Response } from 'express';

//Utils
import { startSever } from './utils/startserver';
import { sendReponse } from './utils/sendresponse';

//Constants
import { devCorsSetup, prodAndStagingCorsSetup } from './constants/cors';
import { firebaseConfig } from './constants/firebaseconfig';

//Passport
import { verifyUser } from './passport/passport';
import passport from 'passport';
var LocalStrategy = require('passport-local');

//Firebase
import * as admin from 'firebase-admin';

// Register the 'local' strategy with Passport
passport.use(new LocalStrategy(verifyUser));

// Initialize Firebase
admin.initializeApp(firebaseConfig);
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors')
const app: Express = express();
const morgan = require('morgan');
const loginRouter = require('./routes/login');

// Load variables from .env into memory
dotenv.config();

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
app.use(express.json());

startSever(port, environment, app)

app.use('/login', loginRouter);

app.get('/', (req: Request, res: Response) => {
    sendReponse.success(res, "Success")
});

//404
app.use((req: Request, res: Response) => {
    sendReponse.notFound(res, "Not Found")
});





