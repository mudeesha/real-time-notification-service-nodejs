const db = require('../db');

module.exports = async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'Missing API key' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM api_keys WHERE api_key = ? AND is_active = 1',
      [apiKey]
    );

    if (!rows.length) {
      return res.status(403).json({ message: 'Invalid or inactive API key' });
    }

    // Attach client info to request for later use
    req.apiClient = rows[0];
    next();
  } catch (err) {
    console.error('API key auth error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
