const express = require('express');
const router = express.Router();
const fcmController = require('../controllers/fcmController');

router.post('/register', fcmController.registerToken);
router.post('/remove', fcmController.removeToken);
// router.post('/send', fcmController.sendNotification);

module.exports = router;




