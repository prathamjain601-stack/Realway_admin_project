import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // On mount: if redirected with ?maintenance=true, verify with backend
  useEffect(() => {
    if (searchParams.get('maintenance') === 'true') {
      api.get('/auth/maintenance-status')
        .then(({ data }) => {
          if (data.maintenanceMode) {
            setIsMaintenanceActive(true);
          }
          // Clear the URL param either way so a manual refresh re-checks
          setSearchParams({}, { replace: true });
        })
        .catch(() => {
          setSearchParams({}, { replace: true });
        });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMaintenanceMessage('');

    try {
      const response = await api.post('/auth/login', { email, password });
      setAuth(response.data.token, response.data.refreshToken, response.data.user);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 503 && err.response?.data?.maintenanceMode) {
        setMaintenanceMessage(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
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
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 mt-2">Sign in to your Aura Admin account</p>
          </div>

          {/* Maintenance mode banner */}
          {(isMaintenanceActive || maintenanceMessage) && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-300">System Under Maintenance</p>
                <p className="text-xs text-amber-400/80">
                  {maintenanceMessage || 'The system is currently under maintenance. Only administrators can log in at this time.'}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  placeholder="admin@aura.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

