import { Request, Response } from 'express';
import crypto from 'crypto';
import os from 'os';
import { AuditLog, ApiKey, SystemSetting, User, Session, ErrorLog } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getSystemHealth } from '../services/metricsCollector';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const action = req.query.action as string;
    const entityType = req.query.entityType as string;

    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      logs,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSystemInfo = async (req: Request, res: Response) => {
  try {
    const health = getSystemHealth();
    const userCount = await User.count();
    const sessionCount = await Session.count();

    res.json({
      ...health,
      database: {
        totalUsers: userCount,
        activeSessions: sessionCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getApiKeys = async (req: AuthRequest, res: Response) => {
  try {
    const keys = await ApiKey.findAll({
      where: { userId: req.user!.id },
      attributes: { exclude: ['key'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const rawKey = `aura_${crypto.randomBytes(32).toString('hex')}`;

    const apiKey = await ApiKey.create({
      userId: req.user!.id,
      key: rawKey,
      name: name || 'Unnamed Key',
    });

    // Return the raw key only once — it won't be shown again
    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      message: 'Save this key securely. It will not be shown again.',
      createdAt: apiKey.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const revokeApiKey = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!apiKey) return res.status(404).json({ message: 'API key not found' });

    await apiKey.update({ isRevoked: true });
    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SystemSetting.findAll();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await SystemSetting.upsert({ key, value: String(value) });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─── Test Email ───

export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: 'Recipient email is required' });

    const transporter = (await import('../services/emailService')).default;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Aura Admin" <noreply@aura-admin.com>',
      to,
      subject: 'Aura Admin — Test Email',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 32px; border-radius: 12px;">
          <h2 style="color: #3b82f6; margin-top: 0;">✅ Email Configuration Working!</h2>
          <p style="color: #94a3b8;">This is a test email from your Aura Admin Dashboard.</p>
          <p style="color: #64748b; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    res.json({ message: `Test email sent to ${to}` });
  } catch (error: any) {
    res.status(500).json({ message: `Failed to send test email: ${error.message}` });
  }
};

// ─── Database Backups ───

export const listBackupsEndpoint = async (req: Request, res: Response) => {
  try {
    const { listBackups } = await import('../services/backupService');
    const backups = listBackups();
    res.json(backups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBackupEndpoint = async (req: Request, res: Response) => {
  try {
    const { createBackup } = await import('../services/backupService');
    const result = await createBackup();
    res.status(201).json({ message: 'Backup created successfully', ...result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreBackupEndpoint = async (req: Request, res: Response) => {
  try {
    const { restoreBackup } = await import('../services/backupService');
    const filename = req.params.filename as string;
    await restoreBackup(filename);
    res.json({ message: `Database restored from ${filename}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBackupEndpoint = async (req: Request, res: Response) => {
  try {
    const { deleteBackupFile } = await import('../services/backupService');
    deleteBackupFile(req.params.filename as string);
    res.json({ message: 'Backup deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadBackupEndpoint = async (req: Request, res: Response) => {
  try {
    const { getBackupPath } = await import('../services/backupService');
    const filename = req.params.filename as string;
    const filepath = getBackupPath(filename);
    res.download(filepath, filename);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

// ─── Error Logs ───

export const getErrorLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const level = req.query.level as string;

    const where: any = {};
    if (level) where.level = level;

    const { count, rows: logs } = await ErrorLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      logs,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const clearErrorLogs = async (req: Request, res: Response) => {
  try {
    const { Op } = require('sequelize');
    const olderThan = req.query.olderThan as string;

    const where: any = {};
    if (olderThan) {
      where.createdAt = { [Op.lt]: new Date(olderThan) };
    }

    const deleted = await ErrorLog.destroy({ where });
    res.json({ message: `${deleted} error logs cleared` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─── Rate Limit Configuration ───

export const getRateLimitConfig = async (req: Request, res: Response) => {
  try {
    const settings = await SystemSetting.findAll({
      where: {
        key: ['rate_limit_window_ms', 'rate_limit_max', 'auth_rate_limit_window_ms', 'auth_rate_limit_max'],
      },
    });

    const config: Record<string, string> = {};
    settings.forEach((s: any) => { config[s.key] = s.value; });

    res.json({
      api: {
        windowMs: parseInt(config['rate_limit_window_ms']) || 15 * 60 * 1000,
        max: parseInt(config['rate_limit_max']) || 100,
      },
      auth: {
        windowMs: parseInt(config['auth_rate_limit_window_ms']) || 15 * 60 * 1000,
        max: parseInt(config['auth_rate_limit_max']) || 10,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateRateLimitConfig = async (req: Request, res: Response) => {
  try {
    const { api, auth } = req.body;

    if (api) {
      if (api.windowMs) await SystemSetting.upsert({ key: 'rate_limit_window_ms', value: String(api.windowMs) });
      if (api.max) await SystemSetting.upsert({ key: 'rate_limit_max', value: String(api.max) });
    }
    if (auth) {
      if (auth.windowMs) await SystemSetting.upsert({ key: 'auth_rate_limit_window_ms', value: String(auth.windowMs) });
      if (auth.max) await SystemSetting.upsert({ key: 'auth_rate_limit_max', value: String(auth.max) });
    }

    res.json({ message: 'Rate limit configuration updated. Changes take effect within 60 seconds.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
