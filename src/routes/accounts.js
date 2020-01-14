const express = require('express');
const auth = require('../middleware/auth.js');
const Account = require('../models/account.js');
const twitter = require('../drivers/social/twitter.js');

const router = express.Router();

router.get('/accounts', auth, async (req, res) => {

    try {

        const accounts = await req.user.getAccounts();
        let providers = [];
        
        accounts.forEach((account) => {
            providers[providers.length] = account.provider;
        });

        res.send({ providers });

    } catch (error) {
        res.status(500).send();
    }

});

router.post('/accounts/twitter', auth, async (req, res) => {

    const accessTokenKey = req.body.accessTokenKey;
    const accessTokenSecret = req.body.accessTokenSecret;
    if (accessTokenKey === undefined || accessTokenSecret === undefined) {
        
        return res.status(422).send({
            error: 'Missing accessTokenKey and/or accessTokenSecret',
        });

    }

    try {

        const account = new Account({
            provider: twitter.name,
            credentials: [
                {
                    type: 'accessTokenKey',
                    value: accessTokenKey,
                },
                {
                    type: 'accessTokenSecret',
                    value: accessTokenSecret,
                },
            ],
            owner: req.user._id,
        });

        await account.save();
        res.status(201).send();

    } catch (error) {
        
        res.status(400).send({
            error: 'Did you already add credentials for this provider?',
        });

    }

});

router.delete('/accounts/twitter', auth, async (req, res) => {

    try {

        await Account.deleteOne({
            owner: req.user._id,
            provider: twitter.name,
        });

        res.send();

    } catch (error) {
        res.status(500).send();
    }

});

module.exports = router;
