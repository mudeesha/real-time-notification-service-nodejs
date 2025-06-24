const { Expo } = require('expo-server-sdk');

class ExpoNotificationService {
  constructor() {
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  /**
   * Validates if the given token is a valid Expo push token
   * @param {string} token - The push notification token to validate
   * @returns {boolean} - Whether the token is valid
   */
  isValidExpoPushToken(token) {
    return Expo.isExpoPushToken(token);
  }

  /**
   * Sends push notifications to the specified Expo push tokens
   * @param {Array<string>} pushTokens - Array of Expo push tokens
   * @param {Object} notification - The notification object containing title, body, and data
   * @returns {Promise<Array>} - Array of push receipts
   */
  async sendNotifications(pushTokens, notification) {
    // Create the messages that you want to send to clients
    const messages = pushTokens.map(token => ({
      to: token,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      priority: 'high',
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    try {
      // Send the chunks to the Expo push notification service
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending chunk:', error);
          // Continue with other chunks even if one fails
        }
      }

      return tickets;
    } catch (error) {
      console.error('Error in sendNotifications:', error);
      throw error;
    }
  }

  /**
   * Gets the delivery status of push notifications
   * @param {Array<string>} receiptIds - Array of receipt IDs to check
   * @returns {Promise<Array>} - Array of push receipts
   */
  async getPushNotificationReceipts(receiptIds) {
    const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts = [];

    try {
      for (const chunk of receiptIdChunks) {
        try {
          const receiptChunk = await this.expo.getPushNotificationReceiptsAsync(chunk);

          // Process the receipts to handle any errors
          for (const receiptId in receiptChunk) {
            const receipt = receiptChunk[receiptId];
            if (receipt.status === 'error') {
              const { message, details } = receipt;
              console.error(
                `Error for receipt ${receiptId}: ${message}`,
                details
              );

              // Handle specific error cases
              if (details?.error === 'DeviceNotRegistered') {
                // Token is no longer valid and should be removed from your database
                // Implement token removal logic here
                console.log(`Token should be removed for receipt ${receiptId}`);
              }
            }
            receipts.push({ id: receiptId, receipt });
          }
        } catch (error) {
          console.error('Error checking receipt chunk:', error);
          // Continue with other chunks even if one fails
        }
      }

      return receipts;
    } catch (error) {
      console.error('Error in getPushNotificationReceipts:', error);
      throw error;
    }
  }
}

module.exports = new ExpoNotificationService();