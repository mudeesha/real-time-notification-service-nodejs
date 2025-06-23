const db = require('../db');

module.exports = async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    console.log('Notification service interrupted! Missing API key');
    return res.status(401).json({ message: 'Notification service interrupted! Missing API key' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM api_keys WHERE api_key = ? AND is_active = 1',
      [apiKey]
    );

    if (!rows.length) {
      console.log('Notification service interrupted! Invalid or inactive API key');
      return res.status(403).json({ message: 'Notification service interrupted! Invalid or inactive API key' });
    }

    // Attach client info to request for later use
    req.apiClient = rows[0];

    next();
  } catch (err) {
    console.error('Notification service interrupted! API key auth error:', err);
    res.status(500).json({ message: 'Notification service interrupted! Internal server error - API key auth' });
  }
};
