const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {

            if (validator.isEmail(value) === false) {
                throw new Error('Email is invalid');
            }

        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {

            const validatorSchema = new passwordValidator();
            validatorSchema
                .is().min(16)
                .has().uppercase()
                .has().lowercase()
                .has().digits()
                .has().symbols();

            if (validatorSchema.validate(value) === false) {
                throw new Error('Password must contain uppercase and lowercase letters, numbers, and special characters.');
            }

        },
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
    }],
}, {
    timestamps: true,
});

UserSchema.methods.toJSON = function () {

    const user = this.toObject();
    delete user.password;
    delete user.tokens;

    return user;

};

UserSchema.methods.generateAuthToken = async function () {

    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;

}

UserSchema.statics.findByCredentials = async function (email, password) {

    const user = await User.findOne({ email });
    if (user === null) {
        throw new Error('Unable to login.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch === false) {
        throw new Error('Unable to login.');
    }

    return user;

}

UserSchema.pre('save', async function (next) {

    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    
    next();

});

const User = mongoose.model('User', UserSchema);

module.exports = User;
