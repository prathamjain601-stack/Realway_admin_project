import { Request, Response } from 'express';
import { Notification } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { userId: req.user!.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.json({
      notifications,
      unreadCount,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.update({ isRead: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user!.id, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, message, type } = req.body;

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'info',
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
