const express = require('express');
const userRoutes = require('./routes/users.js');
const dashboardRoutes = require('./routes/dashboard.js');
require('./db.js');

const app = express();

app.use(express.json());
app.use(userRoutes);
app.use(dashboardRoutes);

module.exports = app;
