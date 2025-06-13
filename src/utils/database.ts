import { Collection, MongoClient } from "mongodb";

if (process.env.MONGODB_URL == undefined) {
  console.error("The MONGODB_URL environment variable is undefined.");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URL);
(async () => {
	await client.connect();
  console.log("Successfully connected to the MongoDB database!")
})();

const database = client.db();

export default function collection(name: string): Collection<object> {
  return database.collection(name)
}
