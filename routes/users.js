const express = require('express')
const router = express.Router();
const { hashSync, compareSync } = require('bycriptjs');
const { v4: uuidv4 } = requre('uuid');

router.post('/register', async function(req, res){
    const{ username, password } = req.body;

    const existingUser = await Db.collection('users').findOne({ username });
    if(existingUser){
        return res.status(400).
    }
})