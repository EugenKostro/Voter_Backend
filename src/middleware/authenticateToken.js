import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import cookieParser from 'cookie-parser';

const secretKey = process.env.JWT_SECRET; 

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, secretKey, (err, user) => {
            if (!err) {
                req.user = user;
            }
            next();
        });
    } else {
        next();
    }
};

export const trackUser = (req, res, next) => {
  if (!req.cookies.userIdentifier && !req.user) {
    const userIdentifier = randomBytes(16).toString('hex');
    res.cookie('userIdentifier', userIdentifier, { maxAge: 900000, httpOnly: true, sameSite: 'Strict' });
}
req.userIdentifier = req.cookies.userIdentifier || randomBytes(16).toString('hex');
next();
};