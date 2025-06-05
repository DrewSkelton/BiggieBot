const { MongoClient } = require("mongodb");

if (process.env.MONGODB_URL == undefined) {
  console.error("The MONGODB_URL environment variable is undefined");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URL);
const database = client.db();

async function collection(name) {
  return database.collection(name)
}

module.exports = {
  collection
}


