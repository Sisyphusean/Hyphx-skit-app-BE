
export const devCorsSetup = {
    origin: '*',
    optionsSuccessStatus: 200
}

const whitelist = ['https://hyphxskittest.vercel.app', 'https://hyphxskittest-peyioyelo-gmailcom.vercel.app', 'https://www.hyphonix.online/']

export const prodAndStagingCorsSetup = {
    origin: (origin: string, callback: Function) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}