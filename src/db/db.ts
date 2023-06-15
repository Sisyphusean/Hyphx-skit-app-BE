import { MongoClient } from "mongodb";
import { consoleLog } from "../utils/consolelog";
import dotenv from 'dotenv';

// Load variables from .env into memory
dotenv.config();

const mongoClient = require('mongodb').MongoClient;
const dbName = process.env.DB_NAME

const proxySettings = {
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD,
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT
}

var collection;
var client: MongoClient;

/**
 * 
 * @param uri 
 * @returns 
 */

export async function getClient(uri: string) {

    //Proxy for mongoClient.connect
    const options = {
        useNewUrlParser: true,
        proxyHost: proxySettings.host,
        proxyPassword: proxySettings.password,
        proxyUsername: proxySettings.username
    }

    //Configure db according to environment due to need for proxy
    // if (process.env.ENVIRONMENT === "development") {
    //     client = new mongoClient(uri) as MongoClient;
    // } else {
    //     client = new mongoClient(uri, options) as MongoClient;
    // }

    client = new mongoClient(uri) as MongoClient;

    let clientHandle = await client.connect()
    collection = clientHandle.db(dbName)
    return { client, collection }

}

export async function listDatabases(client: MongoClient | undefined) {

    if (client) {
        let databasesList = await client.db().admin().listDatabases();
        // databasesList.databases.forEach(db => console.log(` - ${db.name}`));
        return JSON.stringify(databasesList) as string
    }

}

export async function closeConn() {
    try {
        await client.close();
    } catch (e) {
        console.error("Failed to close connection to DB")
    }
}