import jwt from "jsonwebtoken";
import { compare } from "bcrypt";

const secretKey = "VOTER";

export default async function loginHandler(req, res, db) {
  const { email, password } = req.body;

  try {
    const user = await db.collection("users").findOne({ email });
    if (user && (await compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        secretKey,
        { expiresIn: "24h" }
      );

      res.json({ token });
    } else {
      res.status(401).send("Login failed");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
