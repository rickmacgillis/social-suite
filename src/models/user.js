const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const uuid = require('uuid/v4');
const Account = require('./account.js');

const validatePassword = (value) => {

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

}

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
            validatePassword(value);
        },
    },
    passwordReset: {
        type: String,
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

UserSchema.virtual('accounts', {
    ref: 'Account',
    localField: '_id',
    foreignField: 'owner',
});

UserSchema.methods.toJSON = function () {

    const user = this.toObject();
    delete user.password;
    delete user.passwordReset;
    delete user.tokens;

    return user;

};

UserSchema.methods.getAccounts = async function () {

    const user = this;
    await user.populate({ path: 'accounts' }).execPopulate();

    return user.accounts;

};

UserSchema.methods.generateAuthToken = async function () {

    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;

}

UserSchema.methods.generatePasswordPresetToken = async function () {

    const user = this;
    
    user.passwordReset = uuid();
    await user.save();

    return user.passwordReset;
    
}

UserSchema.statics.validatePassword = validatePassword;

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

UserSchema.post('save', async function (error, doc, next) {

    if (error.name === 'MongoError') {
        next(new Error('An error occurred.'));
    } else if (error.name === 'ValidationError') {

        for (field in error.errors) {
            return next(new Error(error.errors[field].message));
        }

    } else {
        next(error);
    }

});

UserSchema.pre('remove', async function (next) {
    
    const user = this;
    await Account.deleteMany({ owner: user._id });

    next();

});

const User = mongoose.model('User', UserSchema);

module.exports = User;
