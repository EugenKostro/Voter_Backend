import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

export default function (db) {
  router.post("/create", async (req, res) => {
    const { name, maxParticipants, durationInMinutes } = req.body;
    const roomToken = uuidv4();
    const createdAt = new Date();

    const maxDuration = 60;
    const duration = Math.min(Math.max(durationInMinutes, 1), maxDuration);
    const expiresAt = new Date(createdAt.getTime() + duration * 60000);

    try {
      const newRoom = await db.collection("rooms").insertOne({
        name,
        maxParticipants,
        duration: duration,
        roomToken,
        createdAt,
        expiresAt,
      });

      const roomLink = `http://yourdomain.com/rooms/join/${roomToken}`;
      res.status(201).json({ roomLink, id: newRoom.insertedId });
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

  return router;
}
