const notificationService = require('../services/notificationService');

exports.create = async (req, res) => {
  await notificationService.create(req, res);
};
exports.getAll = async (req, res) => {
  await notificationService.getAll(req, res);
};
exports.clearAll = async (req, res) => {
  await notificationService.clearAll(req, res);
};
exports.markAsRead = async (req, res) => {
  await notificationService.markAsRead(req, res);
};