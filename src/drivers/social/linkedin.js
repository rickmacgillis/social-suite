const request = require('request');

module.exports = {

    name: 'linkedin',

    make(user) {

        let access_token_key = null;

        if (process.env.APP_ENV === "test") {
            access_token_key = process.env.LINKEDIN_ACCESS_TOKEN;
        } else if (user === undefined) {
            throw new Error('Unspecified user for Twitter instantiation');
        }

        return request.defaults({
            baseUrl: "https://api.linkedin.com/v2/",
            auth: {
                bearer: access_token_key,
            },
            headers: {
                "X-Restli-Protocol-Version": "2.0.0",
            },
        });

    },

    post(client, user, statusMessage) {

        const promise = new Promise((resolve, reject) => {

            // Get the author's URN from `user`.
            const urn = 'urn:li:person:1234567';
            
            client.post('/ugcPosts', {

                "author": urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": statusMessage
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }

            }, function(error, response, body) {
            
                if(error !== null) {
                    reject(`Linkedin said: ${error.message}`);
                }

                resolve();
    
            });

        });

        return promise;

    },

};
