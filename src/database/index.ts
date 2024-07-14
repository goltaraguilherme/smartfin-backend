import * as mongoDB from "mongodb";
import * as dotenv from "dotenv"
dotenv.config();

export const collections: {users?: mongoDB.Collection } = {}

const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    <string>process.env.STRING_CONNECT_ATLAS_MONGODB,{
        serverApi: {
        version: mongoDB.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        }
    });

async function connectToDatabase() {

    try {
        await client.connect();

        await client.db(<string>process.env.DB_NAME).command({ping:1});

        console.log("Db connect successfully")
        
    } catch (error) {
        console.error(error)
    }
}

//@ts-ignore
connectToDatabase();

let db = client.db(<string>process.env.DB_NAME)

export default db;



