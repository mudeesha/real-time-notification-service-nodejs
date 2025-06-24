const fcmService = require('../services/fcmService');

exports.registerToken = async (req, res) => {
  await fcmService.registerToken(req, res);
};
exports.removeToken = async (req, res) => {
  await fcmService.removeToken(req, res);
};
exports.sendPushNotification = async (req, res) => {
  await fcmService.sendPushNotification(req, res);
};
