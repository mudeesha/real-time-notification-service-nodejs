const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// Apply to all routes
router.use(apiKeyAuth);

router.post('/', notificationController.create);
router.get('/', notificationController.getAll);
router.put('/clear-all', notificationController.clearAll);
router.put('/read/:id', notificationController.markAsRead);

module.exports = router;