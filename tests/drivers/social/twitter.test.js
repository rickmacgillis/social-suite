const twitter = require('../../../src/drivers/social/twitter/twitter.js');

describe.skip('Twitter Driver Test Suite', () => {

    test('Should post to Twitter', async () => {

        const client = twitter.make();
        expect(() => {

            twitter.post(client, 'I Love Twitter')
            .catch((error) => {
                throw new Error(error);
            });

        }).not.toThrow();

    });

});
