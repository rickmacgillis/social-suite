const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user.js');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    email: 'test@example.com',
    password: 'dw7IMkdpwK6WK%fV',
    tokens: [{
        token: jwt.sign({ _id: userOneId.toString() }, process.env.JWT_SECRET),
    }],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    email: 'test2@example.com',
    password: 'ooQxrWn5ioTV28@X',
    tokens: [{
        token: jwt.sign({ _id: userTwoId.toString() }, process.env.JWT_SECRET),
    }],
};

const setupDatabase = async () => {

    await User.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();

};

module.exports = {
    setupDatabase,
    userOneId,
    userOne,
    userTwoId,
    userTwo,
};
