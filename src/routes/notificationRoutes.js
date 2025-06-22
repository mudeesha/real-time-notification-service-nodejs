const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const verifyJwt = require('../middleware/verifyJwt');

// Apply to all routes
// router.use(apiKeyAuth);

// router.post('/', notificationController.create);
// router.get('/', notificationController.getAll);
// router.put('/clear-all', notificationController.clearAll);
// router.put('/read/:id', notificationController.markAsRead);

router.post('/', apiKeyAuth, verifyJwt, notificationController.create);
router.get('/', apiKeyAuth, verifyJwt, notificationController.getAll);
router.put('/clear-all', apiKeyAuth, verifyJwt, notificationController.clearAll);
router.put('/read/:id', apiKeyAuth, verifyJwt, notificationController.markAsRead);

module.exports = router;