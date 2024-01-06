const express = require('express')
const router = express.Router();
const User = require('../models/User');

router.post('/register', async function(req, res, next){
    try{
        const user = new User(req.body);
        await user.save();
        res.status(201).send({message: 'User registered successfully!'});
    }
    catch(error){
        res.status(400).send({error: error.message});
    }
});

module.exports = router;