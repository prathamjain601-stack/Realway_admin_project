import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Loader2, Eye, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  publishedAt: string | null;
  Category?: { id: number; name: string } | null;
  author?: { id: number; email: string; firstName: string; lastName: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ContentViewProps {
  onNewPost?: () => void;
  onEditPost?: (postId: number) => void;
}

const ContentView: React.FC<ContentViewProps> = ({ onNewPost, onEditPost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const currentUser = useAuthStore((s) => s.user);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get('/content/posts', { params });
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: number) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/content/posts/${postId}`);
      toast.success('Post deleted');
      fetchPosts(pagination.page);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      published: 'bg-green-500/10 text-green-400 border-green-500/20',
      archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  const statuses = ['', 'draft', 'published', 'archived'];
  const statusLabels = ['All', 'Drafts', 'Published', 'Archived'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Content Management</h1>
        <button
          id="new-post-btn"
          onClick={onNewPost}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Status Tabs + Search */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-dark-bg/50 rounded-lg p-1">
          {statuses.map((s, i) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === s ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {statusLabels[i]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            id="content-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-dark-bg/50 border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 border-b border-dark-border text-sm text-gray-400">
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Featured</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Filter size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No posts found. Create your first post!</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-dark-bg/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white text-sm">{post.title}</p>
                      {post.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary-500/10 text-primary-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {post.author ? `${post.author.firstName} ${post.author.lastName}`.trim() || post.author.email : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{post.Category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                    <td className="px-6 py-4">
                      {post.isFeatured ? (
                        <span className="text-amber-400 text-xs font-medium">⭐ Featured</span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditPost?.(post.id)}
                          className="p-2 text-gray-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-500/10"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
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
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border">
            <p className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPosts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 text-gray-400 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-300 px-3">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchPosts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg hover:bg-dark-border/50 disabled:opacity-30 text-gray-400 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentView;
