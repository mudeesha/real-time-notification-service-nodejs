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
  
  
exports.deactivateToken = async (token) => {
  if (!token) return;

  try {
    await db.query(
      'UPDATE user_fcm_tokens SET is_active = FALSE WHERE token = ?',
      [token]
    );
    console.warn(`🗑️ Invalid FCM token marked inactive: ${token}`);
  } catch (error) {
    console.error(`⚠️ Failed to deactivate token ${token}:`, error.message);
  }
};


exports.sendPushNotification = async (userId, notification) => {
  if (!userId || !notification || typeof notification !== 'object') {
    console.error('Invalid input: Missing or malformed userId or notification');
    return;
  }

  // const { client_id, notifiable_id } = notification;
  const messageText = notification?.data?.message;

  try {
    const [rows] = await db.query(
      'SELECT token FROM user_fcm_tokens WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    const tokens = rows.map(row => row.token).filter(Boolean);

    if (!tokens.length) {
      console.warn(`No active FCM tokens found for user ${userId}`);
      return;
    }

    const messages = tokens.map(token => ({
      token,
      notification: {
        title: 'New Message!',
        body: messageText || 'You have a new notification',
      },
      data: {
        url: notification?.data?.url || '/notifications',
        type: notification?.type || 'default',
      },
    }));

    const responses = await Promise.allSettled(
      messages.map(msg => admin.messaging().send(msg))
    );

    for (let i = 0; i < responses.length; i++) {
      const result = responses[i];
      const token = tokens[i];

      if (result.status === 'fulfilled') {
        console.log(`✅ Notification sent to ${token}: ${result.value}`);
      } else {
        console.error(`Failed to send to ${token}:`, result.reason?.message);

        const code = result.reason?.errorInfo?.code;
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          await deactivateToken(token);
        }
      }
    }

  } catch (err) {
    console.error(`Unexpected error sending FCM to user ${userId}:`, err);
  }
};


