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

    if (!user_id || !token) {
        return res.status(400).json({ message: 'Missing user_id or token' });
    }

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

exports.sendPushNotification = async (userId, notification) => {
  if (!userId || !notification || typeof notification !== 'object') {
    console.error('Invalid input: Missing or malformed userId or notification');
    return;
  }

  const { client_id, notifiable_id } = notification;
  const messageText =  notification.data.message;

  if (!client_id || !notifiable_id) {
    console.error('Notification payload missing client_id, notifiable_id');
    return;
  }

  try {
    const [[row]] = await db.query(
      'SELECT token FROM user_fcm_tokens WHERE user_id = ? AND is_active = TRUE LIMIT 1',
      [userId]
    );

    if (!row || !row.token) {
      console.warn(`No active FCM token found for user ${userId}`);
      return;
    }

    const token = row.token;
    const stringNotification = JSON.stringify(notification);


    if (!token.length) {
      console.warn(`No active FCM tokens found for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: 'New Message!',
        body: messageText,
      },
      data: {
        stringNotification
      },
      token: token,
    };
    
    const response = await admin.messaging().send(message);
    console.log(`✅ FCM sent to user ${notifiable_id}:`, response);

  } catch (err) {
    console.error(`❌ Error sending FCM to user ${notifiable_id}:`, err);
  }
};


