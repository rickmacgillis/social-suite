const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const auth = async (req, res, next) => {

    try {
        
        const token = req.header('Authorization').substr("Bearer ".length);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token,
        });

        if (user === null) {
            throw new Error();
        }

        req.user = user;
        req.token = token;

        next();

    } catch (error) {
        res.status(401).send({
            error: "Please authenticate.",
        });
    }

};

module.exports = auth;
