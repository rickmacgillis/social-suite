const express = require('express');
const User = require('../models/user.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.post('/users', async (req, res) => {
    
    const user = new User(req.body);

    try {

        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });

    } catch (error) {
        res.status(422).send(error);
    }

});

router.post('/users/login', async (req, res) => {

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });

    } catch (error) {console.log(error);
        res.status(401).send();
    }

});

router.post('/users/logout', auth, async (req, res) => {

    try {

        const validTokens = req.user.tokens.filter((token) => token.token !== req.token);
        req.user.tokens = validTokens;
        await req.user.save();
    
        res.send();

    } catch (error) {
        res.status(500).send();
    }

});

router.patch('/users/me', auth, async (req, res) => {

    try {
         
        

    } catch (error) {
        res.status(422).send(error);
    }

});

router.delete('/users/me', auth, async (req, res) => {

    try {

        await User.deleteOne({ _id: req.user._id });
        res.send(req.user)

    } catch (error) {console.log(error);
        res.status(500).send();
    }

});

module.exports = router;
