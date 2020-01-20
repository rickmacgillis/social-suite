const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CONSUMER_ID,
    clientSecret: process.env.LINKEDIN_CONSUMER_SECRET,
    callbackURL: process.env.APP_URL + '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true,
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

module.exports = {
    passport: passport,
    strategyName: 'linkedin',
};
