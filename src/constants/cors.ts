
export const devCorsSetup = {
    origin: 'https://localhost:5173',
    optionsSuccessStatus: 200
}

const whitelist = ['https://hyphxskittest.vercel.app', 'https://hyphxskittest-peyioyelo-gmailcom.vercel.app']

export const prodAndStagingCorsSetup = {
    origin: (origin: string, callback: Function) => {
        if (whitelist.indexOf(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}