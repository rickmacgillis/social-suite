const express = require('express');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

const auth = require('../middleware/auth');
const Account = require('../models/account');

let twitterTokens = {};

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CONSUMER_ID,
    clientSecret: process.env.LINKEDIN_CONSUMER_SECRET,
    callbackURL: process.env.APP_URL + '/settings/connected-accounts?provider=linkedin',
    scope: ['r_emailaddress', 'r_liteprofile', 'w_member_social'],
    state: true,
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.API_URL + '/accounts/connect/twitter/accessToken',
},
(token, tokenSecret, profile, done) => {
    twitterTokens['accessToken'] = token;
    twitterTokens['accessTokenSecret'] = tokenSecret;
    done(null, profile);
}));

const failureRedirect = process.env.APP_URL + '/settings/connected-accounts?failed=1';
const router = express.Router();

async function deleteAccount(req, res, provider) {

    try {

        await Account.deleteOne({
            owner: req.user._id,
            provider,
        });

        res.send();

    } catch (error) {
        res.status(500).send();
    }

}

async function connectAccount(req, res, provider) {

    try {

        let credentials = [
            {
                type: 'accessTokenKey',
                value: req.body.code,
            },
        ];

        if (req.body.secret) {
            credentials.push({
                type: 'accessTokenSecret',
                value: req.body.secret,
            });
        }

        const account = new Account({ provider, credentials, owner: req.user._id });
    
        await account.save();

      res.status(201).send();

    } catch (error) {

        res.status(400).send({
            error: error.message
        });

    }
    
}

// Linkedin
router.get('/accounts/connect/linkedin', passport.authorize('linkedin', { failureRedirect }));
router.post('/accounts/connect/linkedin/callback', auth, async (req, res) => connectAccount(req, res, 'linkedin'));
router.delete('/accounts/linkedin', auth, async (req, res) => deleteAccount(req, res, 'linkedin'));

// Twitter
router.get('/accounts/connect/twitter', passport.authorize('twitter', { failureRedirect }));
router.get('/accounts/connect/twitter/accessToken', async (req, res, next) => {

    passport.authorize('twitter', { failureRedirect }, (err) => {

        if (err) {
            return res.redirect(failureRedirect);
        }

        return res.redirect(
            process.env.APP_URL + '/settings/connected-accounts?provider=twitter&code=' + twitterTokens.accessToken +
                '&secret=' + twitterTokens.accessTokenSecret
        );

    })(req, res, next);

});
router.post('/accounts/connect/twitter/callback', auth, async (req, res) => connectAccount(req, res, 'twitter'));
router.delete('/accounts/twitter', auth, async (req, res) => deleteAccount(req, res, 'twitter'));

module.exports = router;
