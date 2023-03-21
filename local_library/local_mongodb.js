'use strict'
const { MongoClient } = require('mongodb');
let db = null;

const connect = async () => {
    const client = new MongoClient(`mongodb://localhost:27017/DB`, { useUnifiedTopology: true });

    try {
        const clientConnection = await client.connect();
        const collections = clientConnection.db();
        db = collections;
        // console.log('collection', collections)
        return collections;

    } catch (error) {
        console.log('Mongodb Connection Error', error);
    }
}

const get = async () => {
    if (!db) {
        db = await connect();
        return db;
    } else {
        return db;
    }
}

module.exports = get;