import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      toast.success(res.data.message || 'Password reset successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Invalid / missing token state
  if (!token) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary-900/30 blur-[120px]"></div>
          <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary-800/20 blur-[120px]"></div>
        </div>
        <div className="w-full max-w-md z-10">
          <div className="glass-panel rounded-2xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Lock size={28} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Invalid Reset Link</h2>
            <p className="text-gray-400 text-sm">This password reset link is invalid or has expired. Please request a new one.</p>
            <Link
              to="/forgot-password"
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary-900/30 blur-[120px]"></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary-800/20 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="glass-panel rounded-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {success ? 'Password Reset!' : 'Set New Password'}
            </h2>
            <p className="text-gray-400 mt-2">
              {success
                ? 'Your password has been changed successfully.'
                : 'Enter your new password below.'}
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-green-300">Success!</p>
                  <p className="text-xs text-green-400/80">
                    You can now sign in with your new password.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                <ArrowLeft size={18} />
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-dark-bg/50 border border-dark-border rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="reset-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-dark-bg/50 border border-dark-border rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  id="reset-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
