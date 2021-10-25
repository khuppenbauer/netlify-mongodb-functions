const dotenv = require('dotenv').config();
const { MongoClient } = require("mongodb");

const url = process.env.MONGO_DB_URL;
const db = process.env.MONGO_DB_NAME;

const uri = `${url}?retryWrites=true&writeConcern=majority`;
const client = new MongoClient(uri);

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { collection, query } = body;
  let items = [];
  try {
    await client.connect();
    const database = client.db(db);
    const features = database.collection(collection); 
    const cursor = features.find(query);
    if ((await cursor.count()) === 0) {
      return {
        statusCode: 404,
    };
    }
    await cursor.forEach(item => items.push(item));
  } finally {
    await client.close();
  }
  const res = JSON.stringify(items);
  const headers = {
    'Content-Type': 'application/json'
  }
  return {
      statusCode: 200,
      headers: headers,
      body: res
  };
};
