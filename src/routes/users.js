const express = require('express');
const jwtDecode = require('jwt-decode');
const User = require('../models/user.js');
const auth = require('../middleware/auth.js');
const mail = require('../emails/mail.js');

const router = express.Router();

router.post('/users', async (req, res) => {
    
    const user = new User(req.body);

    try {

        await user.save();
        const token = await user.generateAuthToken();
        const { exp } = jwtDecode(token);
        res.status(201).send({ user, token, expiresIn: exp });

    } catch (error) {

        res.status(422).send({
            error: error.message,
        });
        
    }

});

router.post('/users/login', async (req, res) => {

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        const { exp } = jwtDecode(token);
        res.send({ user, token, expiresIn: exp });

    } catch (error) {

        res.status(401).send({
            error: error.message,
        });
        
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

    const updates = Object.keys(req.body);
    const allowedFields = ['email', 'password'];
    const isValid = updates.every((field) => allowedFields.includes(field));
    if (isValid === false) {

        return res.status(422).send({
            error: `Request may only contain ${allowedFields.join(', ')}`,
        });

    }

    try {

        updates.forEach((field) => req.user[field] = req.body[field]);
        await req.user.save();

        res.send(req.user);

    } catch (error) {
        res.status(422).send({ error: error.message });
    }

});

router.get('/users/me', auth, async (req, res) => {

    try {
        res.send(req.user);
    } catch (error) {
        res.status(500);
    }

});

router.delete('/users/me', auth, async (req, res) => {

    try {

        // Deactivated in production for now.
        if (process.env.APP_ENV !== 'prod') {
            await User.deleteOne({ _id: req.user._id });
        }
        
        res.send(req.user)

    } catch (error) {
        res.status(500).send();
    }

});

router.post('/users/reset-password', async (req, res) => {

    const fields = Object.keys(req.body);
    if (fields.includes('email') === false) {

        res.status(422).send({
            error: 'You must specify an email address.',
        });

    }

    try {

        const email = req.body.email;
        const user = await User.findOne({ email });
        if (user === null) {
            return res.send();
        }

        await user.generatePasswordPresetToken();
        mail.sendPasswordResetEmail(user);

        return res.send();

    } catch (error) {
        res.send();
    }

});

router.patch('/users/reset-password', async (req, res) => {

    const token = req.body.token;
    const password = req.body.password;

    if (token === undefined || password === undefined) {

        return res.status(422).send({
            error: "Missing token and/or password",
        });

    }

    try {
        await User.validatePassword(password);
    } catch (error) {
        return res.status(422).send({ error: error.message });
    }

    try {

        const user = await User.findOne({ passwordReset: token });
        if (user === undefined) {
            return res.send();
        }

        user.password = password;
        user.passwordReset = undefined;
        await user.save();

        res.send();

    } catch (error) {
        res.send();
    }

});

module.exports = router;
