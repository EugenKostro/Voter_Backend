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
    const userIdentifier = req.user ? req.user.userId : req.userIdentifier; // Koristi userId za autentificirane korisnike ili userIdentifier za anonimne
  
    try {
      const room = await db.collection("rooms").findOne({ roomToken });
      if (!room) {
        return res.status(404).json({ message: "Room not found." });
      }
  
      // Provjera je li korisnik već glasao
      const hasVoted = room.votes.some(v => req.user ? v.userId === userIdentifier : v.userIdentifier === userIdentifier);
      if (hasVoted) {
        return res.status(400).json({ message: "You have already voted." });
      }
  
      // Ažuriranje sobe s novim glasom
      const updateResult = await db.collection("rooms").updateOne(
        { roomToken },
        { $push: { votes: { userId: req.user ? userIdentifier : null, userIdentifier: req.user ? null : userIdentifier, vote } } }
      );
  
      if(updateResult.modifiedCount === 1) {
        res.status(200).json({ message: "Vote registered." });
      } else {
        throw new Error("Vote could not be registered");
      }
    } catch (error) {
      console.error("Error during voting process:", error);
      res.status(500).json({ message: "An error occurred while processing your vote." });
    }
  });
  
  

  return router;
}
