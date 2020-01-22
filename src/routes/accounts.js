const express = require('express');

const auth = require('../middleware/auth.js');

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

module.exports = router;
