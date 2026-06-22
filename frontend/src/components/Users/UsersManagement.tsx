import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Users, Search, Filter, Upload, ChevronLeft, ChevronRight, MoreVertical,
  Shield, ShieldAlert, ShieldCheck, Ban, CheckCircle, XCircle, Loader2, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get('/users', { params });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await api.put(`/users/${userId}`, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Failed to update user status');
    }
    setActiveMenu(null);
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Failed to update user role');
    }
    setActiveMenu(null);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Failed to delete user');
    }
    setActiveMenu(null);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const { data } = await api.post('/users/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message);
      setShowImportModal(false);
      setImportFile(null);
      fetchUsers();
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <ShieldAlert size={14} className="text-red-400" />;
      case 'Manager': return <ShieldCheck size={14} className="text-amber-400" />;
      default: return <Shield size={14} className="text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-400 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      banned: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.inactive}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total} total users</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
          >
            <Upload size={18} />
            Import CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            id="user-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-dark-bg/50 border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
        <select
          id="user-role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
        </select>
        <select
          id="user-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 border-b border-dark-border text-sm text-gray-400">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Verified</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-bg/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold text-sm">
                          {(user.firstName?.[0] || user.email[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : 'No Name'}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-gray-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg hover:bg-dark-border/50 transition-colors text-gray-400"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeMenu === user.id && (
                        <div className="absolute right-6 top-12 z-20 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl py-1 text-sm">
                          {currentUser?.role === 'Admin' && (
                            <>
                              <div className="px-3 py-1.5 text-xs text-gray-500 font-medium">Change Role</div>
                              {['Admin', 'Manager', 'User'].map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleRoleChange(user.id, r)}
                                  className={`w-full text-left px-3 py-1.5 hover:bg-dark-border/50 transition-colors flex items-center gap-2 ${user.role === r ? 'text-primary-400' : 'text-gray-300'}`}
                                >
                                  {getRoleIcon(r)} <span>{r}</span>
                                </button>
                              ))}
                              <div className="border-t border-dark-border my-1"></div>
                              <div className="px-3 py-1.5 text-xs text-gray-500 font-medium">Status</div>
                              {user.status !== 'banned' && (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'banned')}
                                  className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2"
                                >
                                  <Ban size={14} /> Ban User
                                </button>
                              )}
                              {user.status === 'banned' && (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'active')}
                                  className="w-full text-left px-3 py-1.5 hover:bg-green-500/10 text-green-400 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircle size={14} /> Unban User
                                </button>
                              )}
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'inactive')}
                                  className="w-full text-left px-3 py-1.5 hover:bg-gray-500/10 text-gray-400 transition-colors flex items-center gap-2"
                                >
                                  <XCircle size={14} /> Deactivate
                                </button>
                              )}
                              <div className="border-t border-dark-border my-1"></div>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2"
                              >
                                <X size={14} /> Delete User
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border">
            <p className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-300 px-3">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Import Users from CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Upload a CSV file with columns: <code className="text-primary-400">email, password, firstName, lastName, role</code>
            </p>
            <div
              className="border-2 border-dashed border-dark-border rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50 transition-colors"
              onClick={() => document.getElementById('csv-file-input')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setImportFile(file);
              }}
            >
              <Upload size={32} className="mx-auto mb-3 text-gray-500" />
              <p className="text-sm text-gray-400">
                {importFile ? importFile.name : 'Click or drag & drop a CSV file'}
              </p>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setImportFile(e.target.files[0])}
              />
            </div>
            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {importing ? 'Importing...' : 'Import Users'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
