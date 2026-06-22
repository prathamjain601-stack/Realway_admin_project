import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Session, AuditLog } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendVerificationEmail } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_change_in_prod';

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      passwordHash: password, // Hook will hash it
      firstName: firstName || '',
      lastName: lastName || '',
      role: role || 'User',
      verificationToken,
      isVerified: false,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Audit log
    await AuditLog.create({
      userId: user.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user.id,
      changes: { email },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({ where: { verificationToken: token as string } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    await user.update({ isVerified: true, verificationToken: null });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Create session
    await Session.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ipAddress: req.ip || req.socket?.remoteAddress || null,
    });

    // Audit log
    await AuditLog.create({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      await Session.destroy({ where: { token } });
    }

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: req.user.id,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const payload = { id: user.id, role: user.role };
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    // Update session
    await Session.update(
      { token: newToken, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { where: { userId: user.id } }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash', 'verificationToken'] },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
