import * as mongoDB from "mongodb";
import * as dotenv from "dotenv"
dotenv.config();

export const collections: {users?: mongoDB.Collection } = {}

async function connectToDatabase() {

    try {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(
            <string>process.env.STRING_CONNECT_ATLAS_MONGODB,{
                serverApi: {
                version: mongoDB.ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
                }
            });

        await client.connect();

        const db = client.db(<string>process.env.DB_NAME);

        console.log("Db connect successfully")

        return db
        
    } catch (error) {
        console.error(error)
    }
}

let db = connectToDatabase();

export default db;



