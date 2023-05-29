import { Express } from 'express';


export function startSever(port: string | undefined, environment: string | undefined, app: Express) {

    console.log(`Running Environment: ${environment}`)

    let portNumber = Number(port)

    if (environment === 'development' && port) {
        const https = require('https');
        const http = require('http');
        const fs = require('fs');

        const options = {
            key: fs.readFileSync('certs/selfsigned.key'),
            cert: fs.readFileSync('certs/selfsigned.crt')
        };

        https.createServer(options, app).listen(portNumber, () => {
            console.log(`HTTPS Dev Server running on port ${portNumber}`);
        });

        http.createServer(options, app).listen(portNumber + 1, () => {
            console.log(`HTTP Dev Server running on port ${portNumber+1}`);
        });

    }

    if (environment === 'production' || environment === 'staging' && port) {
        console.log(`Server running on port ${portNumber}`)
        app.listen(portNumber)
    }

}