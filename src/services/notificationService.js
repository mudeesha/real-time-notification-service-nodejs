const db = require('../db');
const { emitToUser, isUserConnected } = require('../sockets/socketHandler');
const { sendPushNotification } = require('./fcmService'); 
const { v4: uuidv4 } = require('uuid');

exports.create = async (req, res) => {
  const { notifiable_id, notifiable_type, type, data } = req.body;

  // Ensure the notifiable_id matches the authenticated user
  if (parseInt(notifiable_id) !== parseInt(req.user.id)) {
    console.log('User authentication faield!');
    return res.status(403).json({ message: 'User authentication faield!' });
  }

  try {
    const clientId = req.apiClient.client_id; 
    const id = uuidv4();

    await db.execute(
      'INSERT INTO notifications (id, client_id, notifiable_id, notifiable_type, type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, clientId, notifiable_id, notifiable_type, type, JSON.stringify(data), new Date(), new Date()]
    );

    const payload = {
      id,
      client_id: clientId,
      notifiable_id,
      notifiable_type,
      type,
      data
    }

    if (isUserConnected(notifiable_id)) {
      emitToUser(notifiable_id, 'notification.sent', payload);
      console.log('📡 Sent via WebSocket');
    } else {
      await sendPushNotification(notifiable_id, payload);
      console.log('📲 Sent via FCM');
    }

    // emitToUser(notifiable_id, 'notification.sent', payload);

    console.log("Notification stored and emitted");
    res.status(201).json({ message: 'Notification stored and emitted' });
  } catch (err) {
    console.error('Insert error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Notification with this ID already exists' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAll = async (req, res) => {
  const userId = parseInt(req.query.user_id);
  const authUserId = parseInt(req.user.id);
  const clientId = req.apiClient.client_id;

  if (!userId || userId !== authUserId) {
    return res.status(403).json({ error: 'Unauthorized access to notifications' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE notifiable_id = ? AND client_id = ? ORDER BY created_at DESC',
      [userId, clientId]
    );

    const parsed = rows.map((n) => {
      try {
        n.data = JSON.parse(n.data);
      } catch {}
      return n;
    });

    const [unreadResult] = await db.query(
      'SELECT COUNT(*) AS unread_count FROM notifications WHERE notifiable_id = ? AND read_at IS NULL AND client_id = ?',
      [userId, clientId]
    );

    const unreadCount = unreadResult[0]?.unread_count ?? 0;

    res.json({
      unread_count: unreadCount,
      notifications: parsed
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.clearAll = async (req, res) => {
  const userId = parseInt(req.body.user_id);
  const authUserId = parseInt(req.user.id);
  const clientId = req.apiClient.client_id;

  if (!userId || userId !== authUserId) {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  if (!userId) return res.status(400).json({ message: 'Missing user_id' });
  
  try {
    const [result] = await db.query(
      'UPDATE notifications SET read_at = ? WHERE notifiable_id = ? AND client_id = ? AND read_at IS NULL',
      [new Date(), userId, clientId]
    );
    
    res.json({ 
      message: 'All marked read',
      affectedRows: result.affectedRows 
    });
  } catch {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.markAsRead = async (req, res) => {
  const notificationId = req.params.id;
  const authUserId = parseInt(req.user.id);
  const clientId = req.apiClient.client_id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND client_id = ?',
      [notificationId, clientId]
    );

    const notification = rows[0];

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (parseInt(notification.notifiable_id) !== authUserId) {
      return res.status(403).json({ message: 'You are not authorized to read this notification' });
    }

    await db.query(
      'UPDATE notifications SET read_at = ? WHERE id = ? AND client_id = ?',
      [new Date(), notificationId, clientId]
    );

    res.json({ message: 'Marked as read' });
  } catch(e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
