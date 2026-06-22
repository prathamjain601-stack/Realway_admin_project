import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Settings, Key, ScrollText, Plus, Loader2, Copy, Trash2, Shield,
  ChevronLeft, ChevronRight
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

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
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
      }
    } catch (error) {
      // Settings may not exist yet
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page: number) => {
    const { data } = await api.get(`/admin/logs?page=${page}&limit=20`);
    setAuditLogs(data.logs);
    setLogPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
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

  const settingsFields = [
    { key: 'siteName', label: 'Site Name', placeholder: 'Aura Admin Dashboard', type: 'text' },
    { key: 'maintenanceMode', label: 'Maintenance Mode', placeholder: 'false', type: 'toggle' },
    { key: 'rateLimitPerMinute', label: 'Rate Limit (per minute)', placeholder: '100', type: 'number' },
    { key: 'sessionTimeout', label: 'Session Timeout (minutes)', placeholder: '1440', type: 'number' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>

      {/* Tabs */}
      <div className="glass-panel rounded-xl p-1 flex gap-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        </>
      )}
    </div>
  );
};

export default SettingsView;
