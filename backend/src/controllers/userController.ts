import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcrypt';
import { User, AuditLog } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) || 'DESC';

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash', 'verificationToken'] },
      order: [[sortBy, order]],
      limit,
      offset,
    });

    res.json({
      users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findByPk(req.params.id as string, {
      attributes: { exclude: ['passwordHash', 'verificationToken'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findByPk(req.params.id as string);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, role, status, email } = req.body;

    const updates: any = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;

    // Only Admin can change role and status
    if (req.user?.role === 'Admin') {
      if (role !== undefined) updates.role = role;
      if (status !== undefined) updates.status = status;
    }

    await user.update(updates);

    const updated = await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash', 'verificationToken'] },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findByPk(req.params.id as string);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { currentPassword, newPassword } = req.body;

    // Admin can reset any password without knowing current one
    if (req.user?.role !== 'Admin') {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    await user.update({ passwordHash: newPassword }); // Hook will hash it

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findByPk(req.params.id as string);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const bulkImport = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const record of records) {
      try {
        const email = record.email?.trim();
        if (!email) {
          results.errors.push(`Row missing email field`);
          results.skipped++;
          continue;
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
          results.errors.push(`${email}: already exists`);
          results.skipped++;
          continue;
        }

        await User.create({
          email,
          passwordHash: record.password || 'ChangeMe123!',
          firstName: record.firstName || record.first_name || '',
          lastName: record.lastName || record.last_name || '',
          role: record.role || 'User',
          status: 'active',
          isVerified: true,
        });

        results.created++;
      } catch (err: any) {
        results.errors.push(`${record.email}: ${err.message}`);
        results.skipped++;
      }
    }

    res.json({
      message: `Import complete: ${results.created} created, ${results.skipped} skipped`,
      ...results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process CSV file', error });
  }
};

export const getUserActivity = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      logs,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
