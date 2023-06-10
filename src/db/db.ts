import { MongoClient } from "mongodb";
import { consoleLog } from "../utils/consolelog";

// import { consoleLog } from "../utils/consolelog";

const mongoClient = require('mongodb').MongoClient;


export async function getClient(uri: string) {
    const client = new mongoClient(uri, { useNewUrlParser: true }) as MongoClient;
    let conn = await client.connect()
    return conn
}

export async function listDatabases(client: MongoClient) {
    let databasesList = await client.db().admin().listDatabases();
    // databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    return JSON.stringify(databasesList) as string

}

export async function closeConn(client: MongoClient) {
    try {
        await client.close();
    } catch (e) {
        console.error("Failed to close connection to DB")
    }
}