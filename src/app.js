const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const notificationRoutes = require('./routes/notificationRoutes');

const verifyApiKey = require('./middleware/apiKeyAuth');
const verifyJwt = require('./middleware/verifyJwt');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/notifications', verifyApiKey, verifyJwt, notificationRoutes);

module.exports = app;