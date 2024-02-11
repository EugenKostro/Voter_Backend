import express from "express";
import { MongoClient } from "mongodb";
import roomRoutes from "./routes/rooms.js";
import cors from "cors";
import userRoutes from "./routes/users.js";
import { authenticateToken } from "./middleware/authenticateToken.js";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

dotenv.config(); // Ovo osigurava da se .env varijable učitaju na početku
console.log(process.env.DATABASE_URL);


const app = express();
app.use(cookieParser()); 
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

// Ovdje dodajte modificiranu liniju
const client = new MongoClient(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

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
