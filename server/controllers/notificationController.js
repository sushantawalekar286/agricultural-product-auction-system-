import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    return res.json(notification);
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return res.status(500).json({ message: 'Server error updating notification', error: error.message });
  }
};