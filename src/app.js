const express = require('express');

const accountsRoutes = require('./routes/accounts');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const cors = require('./middleware/cors');
require('./db.js');

const frontend = process.env.APP_FRONTEND.toLowerCase();
const publicDir = require('social-suite-' + frontend + '/node/index');

const app = express();

app.use(express.static(publicDir));

app.use(express.json());
app.use(cors);
app.use('/api/v1', accountsRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', userRoutes);

app.get('*', async (req, res) => {
    res.status(404).send({
        error: 'Not Found',
    });
});

module.exports = app;
