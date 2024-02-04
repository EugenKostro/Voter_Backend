import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

const secretKey = 'VOTER';

async function registerHandler(req, res, db) {
    const { firstName, lastName, email, password } = req.body;
  
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send('All fields are required');
    }
  
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).send('Invalid email format');
    }
  
    try {
      const userExists = await db.collection('users').findOne({ email });
      if (userExists) {
        return res.status(400).send('Email already in use');
      }
  
      const hashedPassword = await hash(password, 10);
      const newUser = await db.collection('users').insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
  
      // Generiranje JWT tokena nakon uspješne registracije
      const token = jwt.sign(
        { userId: newUser.insertedId, email: email },
        secretKey,
        { expiresIn: '24h' }
      );

      // Vraćanje tokena u odgovoru
      res.status(201).json({ token });
    } catch (error) {
      res.status(500).send(error.toString());
    }
}

export default registerHandler;
