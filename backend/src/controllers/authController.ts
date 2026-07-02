import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Session, AuditLog, SystemSetting } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { socketService } from '../server';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_change_in_prod';

/**
 * Forgot Password — generates a one-time reset token and emails it.
 * The token secret includes the user's current passwordHash so it
 * auto-invalidates the moment the password is changed.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email } });

        // Always return success to avoid leaking whether the email exists
        if (!user) {
            return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
        }

        // Secret = global secret + user's current hash (makes the token single-use)
        const resetSecret = JWT_SECRET + user.passwordHash;
        const resetToken = jwt.sign({ id: user.id, email: user.email }, resetSecret, { expiresIn: '1h' });

        await sendPasswordResetEmail(user.email, resetToken);

        // Audit log
        await AuditLog.create({
            userId: user.id,
            action: 'PASSWORD_RESET_REQUEST',
            entityType: 'User',
            entityId: user.id,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });

        res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Reset Password — verifies the one-time token and sets the new password.
 */
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // First decode without verification to extract the user id
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Verify with the secret that includes the user's CURRENT password hash
        // If the password was already changed, this verification will fail
        const resetSecret = JWT_SECRET + user.passwordHash;
        try {
            jwt.verify(token, resetSecret);
        } catch {
            return res.status(400).json({ message: 'Invalid or expired reset token. This link may have already been used.' });
        }

        // Update password (beforeUpdate hook will bcrypt-hash it)
        await user.update({ passwordHash: newPassword });

        // Audit log
        await AuditLog.create({
            userId: user.id,
            action: 'PASSWORD_RESET',
            entityType: 'User',
            entityId: user.id,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });

        res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Reads the session timeout from the SystemSettings table.
 * Returns duration in minutes (defaults to 1440 = 24 hours if not set).
 */
const getSessionTimeoutMinutes = async (): Promise<number> => {
    try {
        const setting = await SystemSetting.findOne({ where: { key: 'sessionTimeout' } });
        if (setting) {
            const minutes = parseInt((setting as any).value, 10);
            if (!isNaN(minutes) && minutes > 0) return minutes;
        }
    } catch {
        // DB error — fall back to default
    }
    return 1440; // 24 hours default
};

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

        // Emit real-time activity event
        if (socketService) {
            socketService.emitActivityLog({
                action: 'USER_REGISTER',
                userId: user.id,
                email,
                userName: `${firstName || ''} ${lastName || ''}`.trim() || email,
                timestamp: new Date(),
            });
        }

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

        // Block non-admin logins during maintenance mode
        if (user.role !== 'Admin') {
            const maintenanceSetting = await SystemSetting.findOne({ where: { key: 'maintenanceMode' } });
            if (maintenanceSetting && (maintenanceSetting as any).value === 'true') {
                return res.status(503).json({
                    message: 'System is under maintenance. Only administrators can log in at this time.',
                    maintenanceMode: true,
                });
            }
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        const payload = {
            id: user.id,
            role: user.role,
        };

        // Read session timeout from DB settings (in minutes)
        const timeoutMinutes = await getSessionTimeoutMinutes();
        const timeoutSeconds = timeoutMinutes * 60;
        const timeoutMs = timeoutMinutes * 60 * 1000;

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: timeoutSeconds });
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: timeoutSeconds * 7 });

        // Create session
        await Session.create({
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + timeoutMs),
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

        // Emit real-time activity event
        if (socketService) {
            socketService.emitActivityLog({
                action: 'USER_LOGIN',
                userId: user.id,
                email: user.email,
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                timestamp: new Date(),
            });
        }

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
        // Read session timeout from DB settings (in minutes)
        const timeoutMinutes = await getSessionTimeoutMinutes();
        const timeoutSeconds = timeoutMinutes * 60;
        const timeoutMs = timeoutMinutes * 60 * 1000;

        const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: timeoutSeconds });

        // Update session
        await Session.update(
            { token: newToken, expiresAt: new Date(Date.now() + timeoutMs) },
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

export const getMaintenanceStatus = async (_req: Request, res: Response) => {
    try {
        const setting = await SystemSetting.findOne({ where: { key: 'maintenanceMode' } });
        const isActive = setting ? (setting as any).value === 'true' : false;
        res.json({ maintenanceMode: isActive });
    } catch (error) {
        res.json({ maintenanceMode: false });
    }
};
