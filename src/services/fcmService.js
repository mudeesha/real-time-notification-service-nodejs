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
  try {
    // console.log(notification);
    // {
    //   id: '1e2492b3-23d0-4cd3-bf33-e05d43682ff2',
    //   client_id: 1,
    //   notifiable_id: 4,
    //   notifiable_type: 'App\\Models\\User',
    //   type: 'GuardianUpdated',
    //   data: { sender_id: 1, message: 'Guardian updated - Prabath Udayanga' }
    // }
    
    
    const [rows] = await db.query(
      'SELECT token FROM user_fcm_tokens WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    const tokens = rows.map(row => row.token);
    if (!tokens.length) {
      console.warn(`No active FCM tokens found for user ${userId}`);
      return;
    }

    const stringifiedData = Object.entries(notification.data || {}).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {});

    // const messages = tokens.map(token => ({
    //   token: token,
    //   notification: {
    //     title: notification.title,
    //     body: notification.body,
    //   },
    //   data: stringifiedData,
    // }));

    const messages = {
      notification: {
        title: 'New Message!',
        body: 'You have a new message from a friend.',
      },
      data: {
        score: '850',
        time: '2:45',
        messageId: '12345',
      },
      token: 'fh2ifQPGQqKzAkS0k3fGBt:APA91bFTuUKVItC52dXTmbYHwwH3JzczhcH1iUawh7-QvS9tVzzK-D_jho-8NSp35SYwp3JWbWaQq0lIPxzKenIjQsdiJG_V3FSd-0YcW97WBieNGGEyuuM',
    };
    
    console.log(messages);
    

    const sendResults = await Promise.all(
      // messages.map(msg => admin.messaging().send(msg))
      admin.messaging().send(messages)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
    );

    console.log(`✅ FCM sent to user ${userId}:`, sendResults);
  } catch (err) {
    console.error(`❌ Error sending FCM to user ${userId}:`, err);
  }
};


