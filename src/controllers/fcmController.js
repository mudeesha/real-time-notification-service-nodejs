const db = require('../db');
const admin = require('../firebase/firebase');

exports.registerToken = async (req, res) => {
    const { user_id, token, platform = 'android' } = req.body;
  
    if (!user_id || !token || !platform) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const now = new Date();
  
      await db.execute(
        `
        INSERT INTO user_fcm_tokens (user_id, token, platform, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          token = VALUES(token),
          platform = VALUES(platform),
          updated_at = VALUES(updated_at),
          is_active = TRUE
        `,
        [user_id, token, platform, now, now]
      );
  
      res.status(200).json({ message: 'FCM token registered successfully' });
    } catch (err) {
      console.error('Error registering FCM token:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };  
  
  
exports.removeToken = async (req, res) => {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    try {
        await db.execute(
        `DELETE FROM user_fcm_tokens WHERE user_id = ? AND token = ?`,
        [userId, token]
        );
        res.json({ message: 'FCM token removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error removing FCM token' });
    }
};

exports.sendNotification = async (req, res) => {
  const { user_id, title, body, data = {} } = req.body;

  if (!user_id || !title || !body) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [rows] = await db.query(
      'SELECT token FROM user_fcm_tokens WHERE user_id = ?',
      [user_id]
    );

    const tokens = rows.map(r => r.token);

    if (!tokens.length) {
      return res.status(404).json({ message: 'No tokens found for user' });
    }

    const message = {
      notification: { title, body },
      data: data,
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);

    res.json({
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send notification' });
  }
};

