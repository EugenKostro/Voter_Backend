import express from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken, trackUser } from "../middleware/authenticateToken.js";

const router = express.Router();

export default function (db) {
  router.post("/create", authenticateToken, async (req, res) => {
    const { name, maxParticipants, durationInMinutes } = req.body;
    const roomToken = uuidv4();
    const createdAt = new Date();
    const creatorId = req.user.userId;

    const maxDuration = 60;
    const duration = Math.min(
      Math.max(parseInt(durationInMinutes), 1),
      maxDuration
    );
    const expiresAt = new Date(createdAt.getTime() + duration * 60000);

    try {
      const newRoom = await db.collection("rooms").insertOne({
        name,
        maxParticipants,
        duration: duration,
        roomToken,
        createdAt,
        expiresAt,
        creatorId,
        votes: [],
      });

      const roomLink = `http://yourdomain.com/rooms/join/${roomToken}`;
      res.status(201).json({ roomLink, roomToken, creatorId });
    } catch (error) {
      res.status(500).send("Error creating the room: " + error.message);
    }
  });

  router.get("/join/:token", async (req, res) => {
    const { token } = req.params;

    try {
      const room = await db.collection("rooms").findOne({ roomToken: token });
      if (!room) {
        return res.status(404).send("Room not found.");
      }

      const currentTime = new Date();
      if (currentTime > room.expiresAt) {
        return res.status(403).send("The link has expired.");
      }

      res.send("Welcome to the room: " + room.name);
    } catch (error) {
      res.status(500).send("Error accessing the room: " + error.message);
    }
  });

  router.get("/:roomToken", authenticateToken, async (req, res) => {
    const { roomToken } = req.params;

    const room = await db.collection("rooms").findOne({ roomToken });
    if (!room) {
      return res.status(404).send("Room not found.");
    }

    res.json(room);
  });

router.post("/vote/:roomToken", trackUser, async (req, res) => {
    const { roomToken } = req.params;
    const { vote } = req.body;
    const userIdentifier = req.user ? req.user.userId : req.userIdentifier;
  
    try {
      const existingVote = await db.collection("rooms").findOne({
        roomToken,
        "votes.userIdentifier": userIdentifier
      });
  
      if (existingVote) {
        return res.status(400).send("You have already voted.");
      }
  
      const result = await db.collection("rooms").updateOne(
        { roomToken },
        {
          $push: {
            votes: { userIdentifier, vote }
          }
        }
      );
  
      if (result.modifiedCount === 1) {
        res.status(200).send("Vote registered successfully.");
      } else {
        throw new Error("Could not register vote.");
      }
    } catch (error) {
      console.error("Error during voting process:", error);
      res.status(500).send("An error occurred while processing your vote.");
    }
  });
  

  return router;
}
