import { Request, Response } from 'express';
import { ChatMessage, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { socketService } from '../server';

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string; // cursor-based pagination

    const where: any = {};
    if (before) {
      const { Op } = require('sequelize');
      where.id = { [Op.lt]: parseInt(before) };
    }

    const messages = await ChatMessage.findAll({
      where,
      include: [{ model: User, as: 'sender', attributes: ['id', 'email', 'firstName', 'lastName', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
    });

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const chatMessage = await ChatMessage.create({
      senderId: req.user!.id,
      message: message.trim(),
    });

    // Fetch with sender info for the response and socket broadcast
    const fullMessage = await ChatMessage.findByPk(chatMessage.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'email', 'firstName', 'lastName', 'role'] }],
    });

    // Broadcast via WebSocket to admin room
    if (socketService) {
      socketService.emitAdminChat(fullMessage?.toJSON());
    }

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
