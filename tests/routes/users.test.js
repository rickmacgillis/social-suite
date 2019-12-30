const request = require('supertest');
const app = require('../../src/app.js');
const User = require('../../src/models/user.js');
const dbFixtures = require('../fixtures/db.js');

beforeEach(dbFixtures.setupDatabase);

test('Should create valid user', async () => {

    const newUser = {
        email: 'test3@example.com',
        password: '63h2qbKs#JZ4ZCMn',
    };

    const res = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

    const user = await User.findOne({
        email: newUser.email,
    });

    expect(user).not.toBeNull();
    expect(user.email).toBe(newUser.email);

    expect(res.body).toMatchObject({
        user: {
            email: user.email,
        },
        token: user.tokens[0].token,
    });

});

test('Should not create user with invalid email', async () => {

    const newUser = {
        email: 'wrong',
        password: '63h2qbKs#JZ4ZCMn',
    };

    await request(app)
        .post('/users')
        .send(newUser)
        .expect(422);

    const user = await User.findOne({
        email: newUser.email,
    });

    expect(user).toBeNull();

});

test('Should not create user with invalid password', async () => {

    await request(app)
        .post('/users')
        .send({
            email: 'test3@example.com',
            password: 'passwordpassword',
        })
        .expect(422);

    
    await request(app)
        .post('/users')
        .send({
            email: 'test3@example.com',
            password: 'passwordpasswor1',
        })
        .expect(422);

    await request(app)
        .post('/users')
        .send({
            email: 'test3@example.com',
            password: 'Passwordpasswor1',
        })
        .expect(422);

    await request(app)
        .post('/users')
        .send({
            email: 'test3@example.com',
            password: 'P@sswordshort1',
        })
        .expect(422);

});

test('Should allow user to log in with valid credentials', async () => {

    const res = await request(app)
        .post('/users/login')
        .send({
            email: dbFixtures.userOne.email,
            password: dbFixtures.userOne.password,
        })
        .expect(200);

    const user = await User.findOne({ email: dbFixtures.userOne.email });
    expect(user).not.toBeNull();
    expect(res.body.token).toBe(user.tokens[1].token);

});

test('Should not allow user to log in with invalid credentials', async () => {

    await request(app)
        .post('/users/login')
        .send({
            email: "wrong@example.com",
            password: "BadPass",
        })
        .expect(401);

});

test('Should allow user to delete own account', async () => {

    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
        .send()
        .expect(200);

});

test('Should allow authenticated user to logout', async () => {

    await request(app)
        .post('/users/logout')
        .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
        .send()
        .expect(200);

});

test('Should not allow unauthenticated user to logout', async () => {

    await request(app)
        .post('/users/logout')
        .send()
        .expect(401);

});
