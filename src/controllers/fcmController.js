const db = require('../db');
const { Expo } = require('expo-server-sdk');

exports.registerToken = async (req, res) => {
    const { user_id, token, platform } = req.body;
  
    if (!user_id || !token) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate Expo push token format
    if (!Expo.isExpoPushToken(token)) {
      return res.status(400).json({ message: 'Invalid Expo push token format' });
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
  
      res.status(200).json({ message: 'Expo push token registered successfully' });
    } catch (err) {
      console.error('Error registering Expo push token:', err);
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
    const { userId, notification } = req.body;

    if (!userId || !notification || !notification.title || !notification.body) {
        return res.status(400).json({ error: "Missing userId or notification content" });
    }
  
    try {
        const [rows] = await db.query(
            `SELECT token FROM user_fcm_tokens WHERE user_id = ? AND is_active = TRUE`,
            [userId]
        );
    
        const tokens = rows.map(row => row.token);
        if (!tokens.length) {
            return res.status(404).json({ error: "No active Expo push tokens found for user" });
        }

        // Create a new Expo SDK client
        const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
        
        // Create messages array
        const messages = [];
        
        for (let pushToken of tokens) {
            // Check that all push tokens are valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                continue;
            }

            messages.push({
                to: pushToken,
                sound: 'default',
                title: notification.title,
                body: notification.body,
                data: notification.data || {},
            });
        }

        // Chunk the messages to send them in batches
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (let chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error("Error sending chunk:", error);
            }
        }

        // Process the tickets
        const receiptIds = [];
        for (let ticket of tickets) {
            if (ticket.status === "error") {
                if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
                    // Handle unregistered device - you might want to remove this token
                    console.log(`Device not registered for token: ${ticket.details.expoPushToken}`);
                }
            }
            if (ticket.status === "ok") {
                receiptIds.push(ticket.id);
            }
        }

        res.json({ message: "Notifications sent", tickets });
  
    } catch (err) {
        console.error("Expo Push Notification error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

