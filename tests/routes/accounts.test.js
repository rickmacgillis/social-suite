const request = require('supertest');
const app = require('../../src/app.js');
const dbFixtures = require('../fixtures/db.js');
const User = require('../../src/models/user.js');
const Account = require('../../src/models/account.js');

beforeEach(dbFixtures.setupDatabase);

describe('Account Connectivity Test Suite', () => {

    test('Should list providers for user', async () => {

        const responseNoProviders = await request(app)
            .get('/api/v1/accounts')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

        expect(responseNoProviders.body.providers).toBeDefined();
        expect(responseNoProviders.body.providers).toHaveLength(0);

        await request(app)
            .post('/api/v1/accounts/connect/twitter/callback')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({
                code: 'testKey',
                secret: 'testSecret',
            })
            .expect(201);

        const responseWithTwitter = await request(app)
            .get('/api/v1/accounts')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

        expect(responseWithTwitter.body.providers).toBeDefined();
        expect(responseWithTwitter.body.providers).toHaveLength(1);
        expect(responseWithTwitter.body.providers[0]).toBe('twitter');

    });

});
