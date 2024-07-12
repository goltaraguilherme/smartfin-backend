import * as mongoDB from "mongodb";
import * as dotenv from "dotenv"

export const collections: {users?: mongoDB.Collection } = {}

export async function connectToDatabase() {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(<string>process.env.STRING_CONNECT_ATLAS_MONGODB);

    await client.connect();

    const db: mongoDB.Db = client.db(<string>process.env.DB_NAME);

    const usersColletion: mongoDB.Collection = db.collection(<string>process.env.COLLECTION_NAME)

    collections.users = usersColletion;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${usersColletion.collectionName}`);

}


