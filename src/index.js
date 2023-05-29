"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const dotenv = require('dotenv');
// Load variables from .env into memory
dotenv.config();
const app = express();
const port = process.env.PORT;
app.get('/', (req, res) => {
    res.send('Hyphx Break The Ice API');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
