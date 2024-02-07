import { Router } from "express";
import registerHandler from "../handlers/registerHandler.js";
import loginHandler from "../handlers/loginHandler.js";

export default function (db) {
  const router = Router();

  router.post("/register", (req, res) => registerHandler(req, res, db));
  router.post("/login", (req, res) => loginHandler(req, res, db));

  return router;
}
