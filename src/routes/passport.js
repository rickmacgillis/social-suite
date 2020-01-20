const express = require('express');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const Account = require('../models/account');

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CONSUMER_ID,
    clientSecret: process.env.LINKEDIN_CONSUMER_SECRET,
    callbackURL: process.env.APP_URL + '/api/v1/accounts/connect/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true,
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

const failureRedirect = process.env.APP_URL + '/settings/connected-accounts?failed=1';
const successRedirect = process.env.APP_URL + '/settings/connected-accounts?success=1';
const router = express.Router();

router.get('/accounts/connect/linkedin', passport.authorize('linkedin', { failureRedirect }));

router.get(
    '/accounts/connect/linkedin/callback',
    passport.authorize('linkedin', { failureRedirect }),
    (err, req, res) => {

        console.log(err);
        console.log('code', req.params.code);
        console.log('req: ', req);
        /*
        const account = new Account({
            provider: 'linkedin',
            credentials: [
                {
                    type: 'accessTokenKey',
                    value: accessToken,
                },
            ],
            owner: req.user._id,
        });

        await account.save();
        */

        res.redirect(successRedirect);
    }
);

module.exports = router;
