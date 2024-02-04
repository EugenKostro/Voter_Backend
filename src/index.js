import express from 'express';
import { MongoClient } from 'mongodb';
import usersRoutes from './routes/users.js';

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000; 
const uri = "mongodb+srv://voter:voter@clustervoter.uzt95d4.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    const db = client.db("Voter");
    
    app.use('/users', usersRoutes(db));
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

main();
