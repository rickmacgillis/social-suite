const mongoose = require('mongoose');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
const path = require('path');
const fs = require('fs');

const CredentialSchema = new mongoose.Schema({
    type: {
        required: true,
        type: String,
    },
    value: {
        required: true,
        type: String,
    },
});

CredentialSchema.plugin(mongooseFieldEncryption, {
    fields: ["value"],
    secret: process.env.MONGOOSE_ENCRYPTION_KEY,
});

const accountSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {

            const driverPath = path.join(__dirname, `../drivers/social/${value}.js`);
            return !!value.match(/^[a-z]*$/i) && fs.existsSync(driverPath);

        },
    },
    credentials: [CredentialSchema],
    owner: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

accountSchema.index({ provider: 1, owner: 1 }, { unique: true });

accountSchema.post('save', async function (error, doc, next) {

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

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
