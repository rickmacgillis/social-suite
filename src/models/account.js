const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const accountSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {

            const driverPath = path.join(__dirname, `../drivers/social/${value}/${value}.js`);
            return value.indexOf('/') === -1 && fs.existsSync(driverPath);

        },
    },
    credentials: [
        {
            type: {
                required: true,
                type: String,
            },
            value: {
                required: true,
                type: String,
            },
        }
    ],
    owner: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

accountSchema.index({ provider: 1, owner: 1 }, { unique: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
