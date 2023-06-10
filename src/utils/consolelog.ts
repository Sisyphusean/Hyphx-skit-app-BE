export function consoleLog(message: string) {
    process.env.ENVIRONMENT === "development" ? console.log(message) : null
}