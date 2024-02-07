import express from "express";
import { MongoClient } from "mongodb";
import roomRoutes from "./routes/rooms.js";
import cors from "cors";
import userRoutes from "./routes/users.js";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;
const uri =
  "mongodb+srv://voter:voter@clustervoter.uzt95d4.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    const db = client.db("Voter");

    app.use("/rooms", roomRoutes(db));
    app.use("/user", userRoutes(db));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

main();
