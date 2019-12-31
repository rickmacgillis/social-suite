const Twitter = require('twitter');

module.exports = {

    name: 'twitter',

    make(user) {

        let access_token_key = null;
        let access_token_secret = null;

        if (process.env.APP_ENV === "test") {

            access_token_key = process.env.TWITTER_ACCESS_TOKEN_KEY;
            access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

        } else if (user === undefined) {
            throw new Error('Unspecified user for Twitter instantiation');
        }

        return new Twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token_key,
            access_token_secret,
        });

    },

    post(client, status) {

        const promise = new Promise((resolve, reject) => {

            client.post('statuses/update', { status },  function(error, tweet, response) {
            
                if(error !== null) {
                    reject(`Twitter said: ${error.message}`);
                }

                resolve();
    
            });

        });

        return promise;

    },

};
