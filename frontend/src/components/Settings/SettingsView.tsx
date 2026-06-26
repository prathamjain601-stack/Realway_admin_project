import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Settings, Key, ScrollText, Plus, Loader2, Copy, Trash2, Shield,
  ChevronLeft, ChevronRight, Mail, Database, Gauge, AlertTriangle,
  Download, RotateCcw, HardDrive, Send, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyItem {
  id: number;
  name: string;
  isRevoked: boolean;
  createdAt: string;
}

interface AuditLogItem {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  ipAddress: string | null;
  createdAt: string;
  user?: { email: string; firstName: string; lastName: string } | null;
}

interface BackupItem {
  filename: string;
  size: number;
  createdAt: string;
}

interface ErrorLogItem {
  id: number;
  level: string;
  message: string;
  endpoint: string | null;
  method: string | null;
  statusCode: number | null;
  createdAt: string;
}

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [logPagination, setLogPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Email tab
  const [testEmailTo, setTestEmailTo] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Backups tab
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // Rate limiting tab
  const [rateLimitConfig, setRateLimitConfig] = useState({
    api: { windowMs: 900000, max: 100 },
    auth: { windowMs: 900000, max: 10 },
  });
  const [savingRateLimit, setSavingRateLimit] = useState(false);

  // Error logs tab
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>([]);
  const [errorLogPagination, setErrorLogPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'rate-limiting', label: 'Rate Limiting', icon: Gauge },
    { id: 'error-logs', label: 'Error Logs', icon: AlertTriangle },
  ];

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'general') {
        const { data } = await api.get('/admin/settings');
        setSettings(data);
      } else if (activeTab === 'api-keys') {
        const { data } = await api.get('/admin/api-keys');
        setApiKeys(data);
      } else if (activeTab === 'audit-logs') {
        await fetchLogs(1);
      } else if (activeTab === 'backups') {
        const { data } = await api.get('/admin/backups');
        setBackups(data);
      } else if (activeTab === 'rate-limiting') {
        const { data } = await api.get('/admin/rate-limit-config');
        setRateLimitConfig(data);
      } else if (activeTab === 'error-logs') {
        await fetchErrorLogs(1);
      }
    } catch (error) {
      // Tab data may not exist yet
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page: number) => {
    const { data } = await api.get(`/admin/logs?page=${page}&limit=20`);
    setAuditLogs(data.logs);
    setLogPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
  };

  const fetchErrorLogs = async (page: number) => {
    const { data } = await api.get(`/admin/error-logs?page=${page}&limit=20`);
    setErrorLogs(data.logs);
    setErrorLogPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    try {
      const { data } = await api.post('/admin/api-keys', { name: newKeyName });
      setGeneratedKey(data.key);
      setNewKeyName('');
      loadTabData();
      toast.success('API key generated');
    } catch (error) {
      toast.error('Failed to generate key');
    }
  };

  const handleRevokeKey = async (id: number) => {
    if (!confirm('Revoke this API key?')) return;
    try {
      await api.delete(`/admin/api-keys/${id}`);
      toast.success('API key revoked');
      loadTabData();
    } catch (error) {
      toast.error('Failed to revoke key');
    }
  };

  // Email handlers
  const handleSendTestEmail = async () => {
    if (!testEmailTo.trim()) { toast.error('Enter a recipient'); return; }
    setSendingTestEmail(true);
    try {
      const { data } = await api.post('/admin/test-email', { to: testEmailTo });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Backup handlers
  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const { data } = await api.post('/admin/backups');
      toast.success(data.message);
      loadTabData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Backup failed');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`⚠️ Restore database from ${filename}? This will overwrite current data!`)) return;
    try {
      toast.loading('Restoring database...', { id: 'restore' });
      const { data } = await api.post(`/admin/backups/${filename}/restore`);
      toast.success(data.message, { id: 'restore' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Restore failed', { id: 'restore' });
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm('Delete this backup?')) return;
    try {
      await api.delete(`/admin/backups/${filename}`);
      toast.success('Backup deleted');
      loadTabData();
    } catch (error) {
      toast.error('Failed to delete backup');
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      const response = await api.get(`/admin/backups/${filename}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  // Rate limit handlers
  const handleSaveRateLimit = async () => {
    setSavingRateLimit(true);
    try {
      await api.put('/admin/rate-limit-config', rateLimitConfig);
      toast.success('Rate limit configuration updated');
    } catch (error) {
      toast.error('Failed to update rate limits');
    } finally {
      setSavingRateLimit(false);
    }
  };

  // Error log handlers
  const handleClearErrorLogs = async () => {
    if (!confirm('Clear all error logs?')) return;
    try {
      const { data } = await api.delete('/admin/error-logs');
      toast.success(data.message);
      fetchErrorLogs(1);
    } catch (error) {
      toast.error('Failed to clear logs');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const settingsFields = [
    { key: 'siteName', label: 'Site Name', placeholder: 'Aura Admin Dashboard', type: 'text' },
    { key: 'maintenanceMode', label: 'Maintenance Mode', placeholder: 'false', type: 'toggle' },
    { key: 'sessionTimeout', label: 'Session Timeout (minutes)', placeholder: '1440', type: 'number' },
    { key: 'alert_memory_percent', label: 'Memory Alert Threshold (%)', placeholder: '90', type: 'number' },
    { key: 'alert_api_response_ms', label: 'API Response Alert (ms)', placeholder: '2000', type: 'number' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>

      {/* Tabs */}
      <div className="glass-panel rounded-xl p-1 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-border/30'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">General Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settingsFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">{field.label}</label>
                    {field.type === 'toggle' ? (
                      <div
                        className={`w-12 h-7 rounded-full cursor-pointer transition-colors relative ${
                          settings[field.key] === 'true' ? 'bg-primary-500' : 'bg-dark-border'
                        }`}
                        onClick={() =>
                          setSettings({ ...settings, [field.key]: settings[field.key] === 'true' ? 'false' : 'true' })
                        }
                      >
                        <div
                          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                            settings[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        ></div>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={settings[field.key] || ''}
                        onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {savingSettings ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              {generatedKey && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-green-400">🔑 New API Key Generated — Copy it now! It won't be shown again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-dark-bg/80 px-4 py-2 rounded-lg text-sm text-gray-200 font-mono truncate">{generatedKey}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKey);
                        toast.success('Copied to clipboard');
                      }}
                      className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 text-green-400 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">Generate New Key</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Key name (e.g., Production API)"
                    className="flex-1 bg-dark-bg/50 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    onClick={handleGenerateKey}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Generate
                  </button>
                </div>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-bg/50 border-b border-dark-border text-sm text-gray-400">
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Created</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          <Key size={32} className="mx-auto mb-2 opacity-20" />
                          <p>No API keys yet</p>
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-dark-bg/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-medium">{key.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                              key.isRevoked
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                            }`}>
                              {key.isRevoked ? 'Revoked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!key.isRevoked && (
                              <button
                                onClick={() => handleRevokeKey(key.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Logs */}
          {activeTab === 'audit-logs' && (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-bg/50 border-b border-dark-border text-sm text-gray-400">
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                    <th className="px-6 py-4 font-medium">Entity</th>
                    <th className="px-6 py-4 font-medium">IP Address</th>
                    <th className="px-6 py-4 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <ScrollText size={32} className="mx-auto mb-2 opacity-20" />
                        <p>No audit logs yet</p>
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-dark-bg/30 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-300">
                          {log.user
                            ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email
                            : 'System'}
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs font-medium">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-400">
                          {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500 font-mono">{log.ipAddress || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {logPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border">
                  <p className="text-sm text-gray-400">{logPagination.total} total entries</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchLogs(logPagination.page - 1)}
                      disabled={logPagination.page <= 1}
                      className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 text-gray-400"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-gray-300 px-3">{logPagination.page} / {logPagination.totalPages}</span>
                    <button
                      onClick={() => fetchLogs(logPagination.page + 1)}
                      disabled={logPagination.page >= logPagination.totalPages}
                      className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 text-gray-400"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail size={20} className="text-primary-400" />
                  SMTP Configuration
                </h2>
                <p className="text-sm text-gray-400">Email configuration is set via environment variables in your <code className="text-primary-400">.env</code> file.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'SMTP Host', value: 'smtp.ethereal.email' },
                    { label: 'SMTP Port', value: '587' },
                    { label: 'From Address', value: 'noreply@aura-admin.com' },
                    { label: 'Status', value: 'Configured via .env' },
                  ].map((item) => (
                    <div key={item.label} className="bg-dark-bg/30 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                      <p className="text-sm text-white font-medium mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">Send Test Email</h2>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 bg-dark-bg/50 border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {sendingTestEmail ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Send Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database size={20} className="text-primary-400" />
                  Database Backups
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadTabData}
                    className="flex items-center gap-2 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {creatingBackup ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    Create Backup
                  </button>
                </div>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-bg/50 border-b border-dark-border text-sm text-gray-400">
                      <th className="px-6 py-4 font-medium">Filename</th>
                      <th className="px-6 py-4 font-medium">Size</th>
                      <th className="px-6 py-4 font-medium">Created</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {backups.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          <HardDrive size={32} className="mx-auto mb-2 opacity-20" />
                          <p>No backups yet</p>
                        </td>
                      </tr>
                    ) : (
                      backups.map((backup) => (
                        <tr key={backup.filename} className="hover:bg-dark-bg/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-mono">{backup.filename}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{formatBytes(backup.size)}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(backup.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDownloadBackup(backup.filename)}
                                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                title="Download"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => handleRestoreBackup(backup.filename)}
                                className="p-2 text-gray-400 hover:text-amber-400 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteBackup(backup.filename)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rate Limiting Tab */}
          {activeTab === 'rate-limiting' && (
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Gauge size={20} className="text-primary-400" />
                Rate Limiting Configuration
              </h2>
              <p className="text-sm text-gray-400">Changes take effect within 60 seconds without server restart.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API Limiter */}
                <div className="bg-dark-bg/30 rounded-xl p-5 space-y-4 border border-dark-border">
                  <h3 className="text-sm font-bold text-white">API Rate Limiter</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 font-medium">Window (minutes)</label>
                      <input
                        type="number"
                        value={Math.round(rateLimitConfig.api.windowMs / 60000)}
                        onChange={(e) =>
                          setRateLimitConfig({
                            ...rateLimitConfig,
                            api: { ...rateLimitConfig.api, windowMs: parseInt(e.target.value) * 60000 || 900000 },
                          })
                        }
                        className="w-full mt-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium">Max Requests per Window</label>
                      <input
                        type="number"
                        value={rateLimitConfig.api.max}
                        onChange={(e) =>
                          setRateLimitConfig({
                            ...rateLimitConfig,
                            api: { ...rateLimitConfig.api, max: parseInt(e.target.value) || 100 },
                          })
                        }
                        className="w-full mt-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Auth Limiter */}
                <div className="bg-dark-bg/30 rounded-xl p-5 space-y-4 border border-dark-border">
                  <h3 className="text-sm font-bold text-white">Auth Rate Limiter</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 font-medium">Window (minutes)</label>
                      <input
                        type="number"
                        value={Math.round(rateLimitConfig.auth.windowMs / 60000)}
                        onChange={(e) =>
                          setRateLimitConfig({
                            ...rateLimitConfig,
                            auth: { ...rateLimitConfig.auth, windowMs: parseInt(e.target.value) * 60000 || 900000 },
                          })
                        }
                        className="w-full mt-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium">Max Requests per Window</label>
                      <input
                        type="number"
                        value={rateLimitConfig.auth.max}
                        onChange={(e) =>
                          setRateLimitConfig({
                            ...rateLimitConfig,
                            auth: { ...rateLimitConfig.auth, max: parseInt(e.target.value) || 10 },
                          })
                        }
                        className="w-full mt-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveRateLimit}
                  disabled={savingRateLimit}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {savingRateLimit ? <Loader2 size={18} className="animate-spin" /> : <Gauge size={18} />}
                  Save Configuration
                </button>
              </div>
            </div>
          )}

          {/* Error Logs Tab */}
          {activeTab === 'error-logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-400" />
                  Error Logs
                </h2>
                <button
                  onClick={handleClearErrorLogs}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-bg/50 border-b border-dark-border text-sm text-gray-400">
                      <th className="px-6 py-4 font-medium">Level</th>
                      <th className="px-6 py-4 font-medium">Message</th>
                      <th className="px-6 py-4 font-medium">Endpoint</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {errorLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <AlertTriangle size={32} className="mx-auto mb-2 opacity-20" />
                          <p>No error logs — everything is running smoothly! 🎉</p>
                        </td>
                      </tr>
                    ) : (
                      errorLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-dark-bg/30 transition-colors">
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                              log.level === 'critical'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : log.level === 'warn'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                              {log.level}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-300 max-w-xs truncate" title={log.message}>
                            {log.message}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-400 font-mono">
                            {log.method && <span className="text-primary-400 mr-1">{log.method}</span>}
                            {log.endpoint || '—'}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-400">{log.statusCode || '—'}</td>
                          <td className="px-6 py-3 text-sm text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {errorLogPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border">
                    <p className="text-sm text-gray-400">{errorLogPagination.total} total errors</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchErrorLogs(errorLogPagination.page - 1)}
                        disabled={errorLogPagination.page <= 1}
                        className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 text-gray-400"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-sm text-gray-300 px-3">{errorLogPagination.page} / {errorLogPagination.totalPages}</span>
                      <button
                        onClick={() => fetchErrorLogs(errorLogPagination.page + 1)}
                        disabled={errorLogPagination.page >= errorLogPagination.totalPages}
                        className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 text-gray-400"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SettingsView;
