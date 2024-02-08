const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secretKey = 'secret';

router.post('/register',(req,res) => {
    const { username, password} = req.body;
    const newUser = new User({username, password});

    newUser.save()
        .then((user) => res.status(201).json(user))
        .catch((err) => res.status(400).json(err))
})

router.post('/login', (req,res) => {
    const { username, password} = req.body;

    User.findOne({username})
        .then((user) => {
            if(!user) {
                return res.status(404).json({error:'User not found'})
            }
            if(user.password !== password) {
                return res.status(401).json({error:'Incorrect password'});
            }

            const payload = {id:user._id, username: user.username};

            jwt.sign(payload, secretKey, { expiresIn:'2h'},(err,token) => {
                if(err) console.log(err);;
                res.json({success:true, token:`Bearer ${token}` });
            });
        })
        .catch((err) => res.status(500).json(err));
});

module.exports = router;