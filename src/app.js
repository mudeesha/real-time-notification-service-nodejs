const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const verifyApiKey = require('./middleware/apiKeyAuth');
const verifyJwt = require('./middleware/verifyJwt');

const notificationRoutes = require('./routes/notificationRoutes');
const fcmRoutes = require('./routes/fcmRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/notifications', verifyApiKey, verifyJwt, notificationRoutes);

app.use('/fcm', fcmRoutes);

module.exports = app;
