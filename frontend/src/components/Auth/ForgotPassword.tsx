import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              {sent ? 'Check Your Email' : 'Forgot Password'}
            </h2>
            <p className="text-gray-400 mt-2">
              {sent
                ? 'We sent a password reset link to your email address.'
                : 'Enter your email and we\'ll send you a reset link.'}
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-green-300">Email Sent Successfully</p>
                  <p className="text-xs text-green-400/80">
                    If an account with <span className="font-medium text-green-300">{email}</span> exists,
                    you'll receive a password reset link shortly. The link expires in 1 hour.
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                <ArrowLeft size={18} />
                Back to Sign In
              </Link>
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
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-500" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-dark-bg/50 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
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

export default ForgotPassword;
