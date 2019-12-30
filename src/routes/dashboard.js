const express = require('express');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    res.send('Dashboard');
});

module.exports = router;
