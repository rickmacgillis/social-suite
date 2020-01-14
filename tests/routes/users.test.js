const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app.js');
const User = require('../../src/models/user.js');
const dbFixtures = require('../fixtures/db.js');

beforeEach(dbFixtures.setupDatabase);

describe('Users Test Suite', () => {

    test('Should create valid user', async () => {

        const newUser = {
            email: 'test3@example.com',
            password: '63h2qbKs#JZ4ZCMn',
        };

        const res = await request(app)
            .post('/api/v1/users')
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

        expect(res.body.tokenExpires).toBeDefined();

    });

    test('Should not create user with invalid email', async () => {

        const newUser = {
            email: 'wrong',
            password: '63h2qbKs#JZ4ZCMn',
        };

        await request(app)
            .post('/api/v1/users')
            .send(newUser)
            .expect(422);

        const user = await User.findOne({
            email: newUser.email,
        });

        expect(user).toBeNull();

    });

    test('Should not create user with invalid password', async () => {

        await request(app)
            .post('/api/v1/users')
            .send({
                email: 'test3@example.com',
                password: 'passwordpassword',
            })
            .expect(422);

        
        await request(app)
            .post('/api/v1/users')
            .send({
                email: 'test3@example.com',
                password: 'passwordpasswor1',
            })
            .expect(422);

        await request(app)
            .post('/api/v1/users')
            .send({
                email: 'test3@example.com',
                password: 'Passwordpasswor1',
            })
            .expect(422);

        await request(app)
            .post('/api/v1/users')
            .send({
                email: 'test3@example.com',
                password: 'P@sswordshort1',
            })
            .expect(422);

    });

    test('Should allow user to log in with valid credentials', async () => {

        const res = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: dbFixtures.userOne.email,
                password: dbFixtures.userOne.password,
            })
            .expect(200);

        const user = await User.findOne({ email: dbFixtures.userOne.email });
        expect(user).not.toBeNull();
        expect(res.body.token).toBe(user.tokens[1].token);
        expect(res.body.tokenExpires).toBeDefined();

    });

    test('Should not allow user to log in with invalid credentials', async () => {

        await request(app)
            .post('/api/v1/users/login')
            .send({
                email: "wrong@example.com",
                password: "BadPass",
            })
            .expect(401);

    });

    test('Should allow user to delete own account', async () => {

        await request(app)
            .delete('/api/v1/users/me')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

    });

    test('Should allow authenticated user to logout', async () => {

        await request(app)
            .post('/api/v1/users/logout')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

    });

    test('Should not allow unauthenticated user to logout', async () => {

        await request(app)
            .post('/api/v1/users/logout')
            .send()
            .expect(401);

    });

    test('Should update user with valid data', async () => {

        const email = 'NewEmail@example.com';
        const newPass = 'newZ@92eNcm#VbiyxSF';
        const response = await request(app)
            .patch('/api/v1/users/me')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({
                email,
                password: newPass,
            })
            .expect(200);

        expect(response.body).toMatchObject({
            email: email.toLowerCase(),
        });

        expect(response.body).not.toHaveProperty('password');

        const user = await User.findOne({ email: email.toLowerCase()});
        const validPassword = await bcrypt.compare(newPass, user.password);
        expect(validPassword).toBe(true);

    });

    test('Should not update user with invalid email', async () => {

        const response = await request(app)
            .patch('/api/v1/users/me')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ email: 'badEmail' })
            .expect(422);

    });

    test('Should not update user with invalid password', async () => {

        const response = await request(app)
            .patch('/api/v1/users/me')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ password: 'badPass' })
            .expect(422);

    });

    test('Should not update user with invalid fields', async () => {

        const response = await request(app)
            .patch('/api/v1/users/me')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send({ junk: 'blah' })
            .expect(422);

    });

    test('Should not update unauthorized user', async () => {

        const email = 'NewEmail@example.com';
        const newPass = 'newZ@92eNcm#VbiyxSF';
        const response = await request(app)
            .patch('/api/v1/users/me')
            .send({
                email,
                password: newPass,
            })
            .expect(401);

    });

    test('Should get logged in user\'s profile', async () => {

        const response = await request(app)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${dbFixtures.userOne.tokens[0].token}`)
            .send()
            .expect(200);

        expect(response.body).toMatchObject({
            email: dbFixtures.userOne.email,
        });

        expect(response.body).not.toHaveProperty('password');

    });

    test('Should not get profile for unauthorized user', async () => {

        await request(app)
            .get('/api/v1/users/me')
            .send()
            .expect(401);

    });

    test('Should reset password for valid user', async () => {

        await request(app)
            .post('/api/v1/users/reset-password')
            .send({
                email: dbFixtures.userOne.email,
            })
            .expect(200);

        const user = await User.findOne({ email: dbFixtures.userOne.email });
        expect(user.passwordReset).toBeDefined();
        expect(user.passwordReset.length).toBe(36);

    });

    test('Should not reset password for nonexistant user', async () => {

        await request(app)
            .post('/api/v1/users/reset-password')
            .send({
                email: 'wrong@example.com',
            })
            .expect(200);

        const user = await User.findOne({ email: dbFixtures.userOne.email });
        expect(user.passwordReset).not.toBeDefined();

    });

    test('Should give an error when no email specified', async () => {

        const response = await request(app)
            .post('/api/v1/users/reset-password')
            .send()
            .expect(422);

        expect(response.body.error).toBeDefined();

    });

    test('Should load password reset page', async () => {

        await request(app)
            .get('/api/v1/users/reset-password')
            .send()
            .expect(200);

    });

    test('Should load password reset confirmation page with token', async () => {

        await request(app)
            .get('/api/v1/users/reset-password-confirm?token=test')
            .send()
            .expect(200);

    });

    test('Should not load password reset confirmation page without token', async () => {

        await request(app)
            .get('/api/v1/users/reset-password-confirm')
            .send()
            .expect(422);

    });

    test('Should reset password for valid token and user', async () => {

        const newPass = 'newZ@92eNcm#VbiyxSF';
        const userBefore = await User.findOne({ email: dbFixtures.userOne.email });
        const token = await userBefore.generatePasswordPresetToken();

        await request(app)
            .patch('/api/v1/users/reset-password')
            .send({
                token: token,
                password: newPass,
            })
            .expect(200);

        const user = await User.findOne({ email: dbFixtures.userOne.email });
        expect(user).not.toBeNull();
        expect(user.passwordReset).not.toBeDefined();
        
        const validPass = await bcrypt.compare(newPass, user.password);
        expect(validPass).toBe(true);

    });

    test('Should send error for missing token or password', async () => {

        const response = await request(app)
            .patch('/api/v1/users/reset-password')
            .send()
            .expect(422);

        expect(response.body.error).toBeDefined();

    });

    test('Should gracefully handle invalid tokens', async () => {

        const newPass = 'newZ@92eNcm#VbiyxSF';
        await request(app)
            .patch('/api/v1/users/reset-password')
            .send({
                token: 'bad',
                password: newPass,
            })
            .expect(200);

    });

    // Heuristic
    test('Should validate password even if user is invalid', async () => {

        const response = await request(app)
            .patch('/api/v1/users/reset-password')
            .send({
                token: 'bad',
                password: 'wrong',
            })
            .expect(422);

        expect(response.body.error).toBeDefined();

    });

});
