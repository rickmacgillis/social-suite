const request = require('supertest');
const app = require('../../src/app.js');
const dbFixtures = require('../fixtures/db.js');
const User = require('../../src/models/user.js');
const Account = require('../../src/models/account.js');

beforeEach(dbFixtures.setupDatabase);

describe('Account Connectivity Test Suite', () => {

    test('Should populate Twitter credentials for current user', async () => {

        const accessTokenKey = 'testKey';
        const accessTokenSecret = 'testSecret';

        await request(app)
            .post('/accounts/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ accessTokenKey, accessTokenSecret })
            .expect(201);

        const account = await Account.findOne({ owner: dbFixtures.userOneId });
        expect(account).not.toBeNull();

        expect(account.provider).toBe('twitter');
        expect(account.credentials).toHaveLength(2);
        
        expect(account.credentials[0].type).toBe('accessTokenKey');
        expect(account.credentials[0].value).toBe(accessTokenKey);
        
        expect(account.credentials[1].type).toBe('accessTokenSecret');
        expect(account.credentials[1].value).toBe(accessTokenSecret);

    });

    test('Should not twice populate Twitter credentials', async () => {

        const accessTokenKey = 'testKey';
        const accessTokenSecret = 'testSecret';

        await request(app)
            .post('/accounts/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ accessTokenKey, accessTokenSecret })
            .expect(201);

        const response = await request(app)
            .post('/accounts/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ accessTokenKey, accessTokenSecret })
            .expect(400);

        expect(response.body.error).toBeDefined();

    });

    test('Should not populate empty Twitter credentials', async () => {

        await request(app)
            .post('/accounts/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(422);

    });

    test('Should not populate Twitter credentials when not logged in', async () => {

        const accessTokenKey = 'testKey';
        const accessTokenSecret = 'testSecret';

        await request(app)
            .post('/accounts/twitter')
            .send({ accessTokenKey, accessTokenSecret })
            .expect(401);

    });

    test('Should delete Twitter credentials for current user', async () => {

        await request(app)
            .post('/accounts/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({
                accessTokenKey: 'testKey',
                accessTokenSecret: 'testSecret',
            })
            .expect(201);

        await request(app)
            .delete('/accounts/twitter')
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
            .delete('/accounts/twitter')
            .send()
            .expect(401);

    });

    test('Should list providers for user', async () => {

        const responseNoProviders = await request(app)
            .get('/accounts')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

        expect(responseNoProviders.body.providers).toBeDefined();
        expect(responseNoProviders.body.providers).toHaveLength(0);

        await request(app)
            .post('/accounts/twitter')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({
                accessTokenKey: 'testKey',
                accessTokenSecret: 'testSecret',
            })
            .expect(201);

        const responseWithTwitter = await request(app)
            .get('/accounts')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

        expect(responseWithTwitter.body.providers).toBeDefined();
        expect(responseWithTwitter.body.providers).toHaveLength(1);
        expect(responseWithTwitter.body.providers[0]).toBe('twitter');

    });

});
