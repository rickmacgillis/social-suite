const express = require('express');
const accountsRoutes = require('./routes/accounts.js');
const userRoutes = require('./routes/users.js');
const dashboardRoutes = require('./routes/dashboard.js');
require('./db.js');

const app = express();

app.use(express.json());
app.use(accountsRoutes);
app.use(userRoutes);
app.use(dashboardRoutes);

app.get('*', async (req, res) => {
    res.status(404).send('Not Found');
});

module.exports = app;
