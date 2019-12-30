const request = require('supertest');
const app = require('../../src/app.js');
const dbFixtures = require('../fixtures/db.js');

beforeEach(dbFixtures.setupDatabase);

test('Should allow authenticated user to view dashboard', async () => {

    await request(app)
        .get('/')
        .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
        .send()
        .expect(200);

});

test('Should not allow unauthenticated user to view dashboard', async () => {

    await request(app)
        .get('/')
        .send()
        .expect(401);

});
