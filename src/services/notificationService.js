const db = require('../db');
const { emitToUser } = require('../sockets/socketHandler');

exports.create = async (req, res) => {
  const { id, notifiable_id, notifiable_type, type, data } = req.body;
  try {
    await db.execute(
      'INSERT INTO notifications (id, notifiable_id, notifiable_type, type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, notifiable_id, notifiable_type, type, JSON.stringify(data), new Date(), new Date()]
    );

    emitToUser(notifiable_id, 'notification.sent', {
      id,
      notifiable_id,
      notifiable_type,
      type,
      data
    });

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
  const userId = req.query.user_id;

  if (!userId || parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized access to user notifications' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE notifiable_id = ? ORDER BY created_at DESC', [userId]
    );

    const parsed = rows.map((n) => {
      try {
        n.data = JSON.parse(n.data);
      } catch {}
      return n;
    });

    res.json(parsed);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.clearAll = async (req, res) => {
  const userId = req.body.user_id;
  if (!userId) return res.status(400).json({ message: 'Missing user_id' });

  try {
    const [result] = await db.query(
      'UPDATE notifications SET read_at = ? WHERE notifiable_id = ? AND read_at IS NULL',
      [new Date(), userId]
    );
    res.json({ message: 'All marked read', affectedRows: result.affectedRows });
  } catch {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.markAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const [result] = await db.query(
      'UPDATE notifications SET read_at = ? WHERE id = ?',
      [new Date(), notificationId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Marked as read' });
  } catch {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};