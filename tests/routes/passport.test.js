const request = require('supertest');
const app = require('../../src/app.js');
const dbFixtures = require('../fixtures/db.js');
const User = require('../../src/models/user.js');
const Account = require('../../src/models/account.js');

beforeEach(dbFixtures.setupDatabase);

describe('Account Connectivity Test Suite', () => {

    test('Should redirect to twitter for authorization', async () => {

        const response = await request(app)
            .get('/api/v1/accounts/connect/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .expect(302);

        expect(response.header.location).toStartWith('https://api.twitter.com/oauth/authenticate');

    });

    test('Should redirect to failed page if invalid tokens', async () => {

        const response = await request(app)
        .get('/api/v1/accounts/connect/twitter/accessToken?oauth_token=123&oauth_verifier=321')
        .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
        .expect(302);

        expect(response.header.location).toBe(process.env.APP_URL + '/settings/connected-accounts?failed=1');

    });

    test('Should populate Twitter credentials for current user', async () => {

        const code = 'testKey';
        const secret = 'testSecret';

        await request(app)
            .post('/api/v1/accounts/connect/twitter/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ code, secret })
            .expect(201);

        const account = await Account.findOne({ owner: dbFixtures.userOneId });
        expect(account).not.toBeNull();

        expect(account.provider).toBe('twitter');
        expect(account.credentials).toHaveLength(2);
        
        expect(account.credentials[0].type).toBe('accessTokenKey');
        expect(account.credentials[0].value).toBe(code);
        
        expect(account.credentials[1].type).toBe('accessTokenSecret');
        expect(account.credentials[1].value).toBe(secret);

    });

    test('Should not twice populate Twitter credentials', async () => {

        const code = 'testKey';
        const secret = 'testSecret';

        await request(app)
            .post('/api/v1/accounts/connect/twitter/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ code, secret })
            .expect(201);

        const response = await request(app)
            .post('/api/v1/accounts/connect/twitter/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ code, secret })
            .expect(400);

        expect(response.body.error).toBeDefined();

    });

    test('Should not populate empty Twitter credentials', async () => {

        await request(app)
            .post('/api/v1/accounts/connect/twitter/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(400);

    });

    test('Should not populate Twitter credentials when not logged in', async () => {

        const code = 'testKey';
        const secret = 'testSecret';

        await request(app)
            .post('/api/v1/accounts/connect/twitter/callback')
            .send({ code, secret })
            .expect(401);

    });

    test('Should delete Twitter credentials for current user', async () => {

        await request(app)
            .post('/api/v1/accounts/connect/twitter/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({
                code: 'testKey',
                secret: 'testSecret',
            })
            .expect(201);

        await request(app)
            .delete('/api/v1/accounts/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

        const user = await User.findOne({ _id: dbFixtures.userOneId });
        expect(user).not.toBeNull();
        
        const accounts = await user.getAccounts();
        expect(accounts).toHaveLength(0);

    });

    test('Should not delete Twitter credentials when not logged in', async () => {

        await request(app)
            .delete('/api/v1/accounts/twitter')
            .send()
            .expect(401);

    });

    test('Should redirect to Linkedin for authorization', async () => {

        const response = await request(app)
            .get('/api/v1/accounts/connect/linkedin')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .expect(302);

        expect(response.header.location).toStartWith('https://www.linkedin.com/oauth/v2/authorization');

    });

    test('Should populate Linkedin credentials for current user', async () => {

        const code = 'testKey';

        await request(app)
            .post('/api/v1/accounts/connect/linkedin/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ code })
            .expect(201);

        const account = await Account.findOne({ owner: dbFixtures.userOneId });
        expect(account).not.toBeNull();

        expect(account.provider).toBe('linkedin');
        expect(account.credentials).toHaveLength(1);
        
        expect(account.credentials[0].type).toBe('accessTokenKey');
        expect(account.credentials[0].value).toBe(code);

    });

    test('Should not twice populate Linkedin credentials', async () => {

        const code = 'testKey';

        await request(app)
            .post('/api/v1/accounts/connect/linkedin/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ code })
            .expect(201);

        const response = await request(app)
            .post('/api/v1/accounts/connect/linkedin/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ code })
            .expect(400);

        expect(response.body.error).toBeDefined();

    });

    test('Should not populate empty Linkedin credentials', async () => {

        await request(app)
            .post('/api/v1/accounts/connect/linkedin/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(400);

    });

    test('Should not populate Linkedin credentials when not logged in', async () => {

        const code = 'testKey';

        await request(app)
            .post('/api/v1/accounts/connect/linkedin/callback')
            .send({ code })
            .expect(401);

    });

    test('Should delete Linkedin credentials for current user', async () => {

        await request(app)
            .post('/api/v1/accounts/connect/linkedin/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({
                code: 'testKey',
            })
            .expect(201);

        await request(app)
            .delete('/api/v1/accounts/linkedin')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

        const user = await User.findOne({ _id: dbFixtures.userOneId });
        expect(user).not.toBeNull();
        
        const accounts = await user.getAccounts();
        expect(accounts).toHaveLength(0);

    });

    test('Should not delete Linkedin credentials when not logged in', async () => {

        await request(app)
            .delete('/api/v1/accounts/linkedin')
            .send()
            .expect(401);

    });

});
