// src/components/AdminDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import ContentManager from './ContentManager';
import api, { BACKEND_URL } from '../api';

interface UserItem {
  user_id: string;
  name: string;
  auth_methods: string[];
  is_admin: boolean;
  profile_complete: boolean;
  disabled: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
}

interface FeedbackItem {
  _id: string;
  user_id: string;
  category: string;
  feedback: string;
  status: string;
  created_at: string;
  screenshot_id?: string;
  has_screenshot: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: '#1e3a5f', text: '#60a5fa' },
  in_progress: { bg: '#3b3a1a', text: '#facc15' },
  resolved: { bg: '#1a3b2a', text: '#4ade80' },
};

const STATUS_CYCLE: Record<string, string> = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'open',
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'feedback' | 'users'>('users');

  // Users state
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersTotal, setUsersTotalCount] = useState(0);
  const [usersTotalAll, setUsersTotalAll] = useState(0);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');

  // Feedback state
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState('');
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackHasMore, setFeedbackHasMore] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Users handlers
  const fetchUsers = useCallback(async (skip = 0, append = false) => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', skip: String(skip) });
      if (usersSearch) params.set('search', usersSearch);
      const response = await api.get(
        `/admin/users?${params.toString()}`,
      );
      const data = response.data;
      setUsersList(prev => append ? [...prev, ...data.users] : data.users);
      setUsersTotalCount(data.total_count);
      setUsersTotalAll(data.total_users);
      setUsersHasMore(data.has_more);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  }, [usersSearch]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  const handleToggleDisable = async (email: string) => {
    try {
      const response = await api.patch(
        `/admin/users/${encodeURIComponent(email)}/disable`,
        {},
      );
      setUsersList(prev =>
        prev.map(u => u.user_id === email ? { ...u, disabled: response.data.disabled } : u)
      );
    } catch (error) {
      console.error('Error toggling user disable:', error);
    }
  };

  // Feedback handlers
  const fetchFeedback = useCallback(async (skip = 0, append = false) => {
    setFeedbackLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', skip: String(skip) });
      if (feedbackFilter) params.set('status', feedbackFilter);

      const response = await api.get(
        `/admin/feedback?${params.toString()}`,
      );

      const data = response.data;
      setFeedbackList(prev => append ? [...prev, ...data.feedback] : data.feedback);
      setFeedbackTotal(data.total_count);
      setFeedbackHasMore(data.has_more);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  }, [feedbackFilter]);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab, fetchFeedback]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = STATUS_CYCLE[currentStatus] || 'open';
    try {
      await api.patch(
        `/admin/feedback/${id}/status`,
        { status: newStatus },
      );
      setFeedbackList(prev =>
        prev.map(fb => fb._id === id ? { ...fb, status: newStatus } : fb)
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(
        `/admin/feedback/${id}`,
      );
      setFeedbackList(prev => prev.filter(fb => fb._id !== id));
      setFeedbackTotal(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (feedbackFilter) params.set('status', feedbackFilter);
      const url = `/admin/feedback/export?${params.toString()}`;

      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'feedback_export.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Admin Dashboard</h1>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <button
          style={activeTab === 'users' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('users')}
        >
          Users {usersTotalAll > 0 && `(${usersTotalAll})`}
        </button>
        <button
          style={activeTab === 'content' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('content')}
        >
          Content Management
        </button>
        <button
          style={activeTab === 'feedback' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback {feedbackTotal > 0 && `(${feedbackTotal})`}
        </button>
      </div>

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <ContentManager />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Search bar */}
          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
              style={{ ...styles.input, marginBottom: 0, maxWidth: 320 }}
            />
            <button onClick={() => fetchUsers()} style={styles.button}>
              Search
            </button>
            <span style={styles.countLabel}>
              {usersTotal === usersTotalAll
                ? `${usersTotalAll} users`
                : `${usersTotal} of ${usersTotalAll} users`}
            </span>
          </div>

          {/* Users table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Auth</th>
                  <th style={styles.th}>Profile</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Last Login</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.user_id} style={styles.tr}>
                    <td style={{ ...styles.td, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.user_id}
                    </td>
                    <td style={styles.td}>{user.name || '—'}</td>
                    <td style={{ ...styles.td, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(user.auth_methods || []).map((method) => (
                        <span
                          key={method}
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: method === 'google' ? '#1a3b2a' : '#1e3a5f',
                            color: method === 'google' ? '#4ade80' : '#60a5fa',
                          }}
                        >
                          {method === 'google' ? 'Google' : 'Email'}
                        </span>
                      ))}
                      {(!user.auth_methods || user.auth_methods.length === 0) && (
                        <span style={{ color: '#6B7280' }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {user.profile_complete
                        ? <span style={{ color: '#4ade80' }}>Complete</span>
                        : <span style={{ color: '#6B7280' }}>Incomplete</span>
                      }
                    </td>
                    <td style={styles.td}>
                      {user.is_admin
                        ? <span style={{ color: '#facc15', fontWeight: 600 }}>Admin</span>
                        : <span style={{ color: '#6B7280' }}>User</span>
                      }
                    </td>
                    <td style={styles.td}>{user.createdAt ? formatDate(user.createdAt) : '—'}</td>
                    <td style={styles.td}>{user.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleDisable(user.user_id)}
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: user.disabled ? '#5f1e1e' : '#1a3b2a',
                          color: user.disabled ? '#fa6060' : '#4ade80',
                        }}
                        title={user.disabled ? 'Click to enable' : 'Click to disable'}
                      >
                        {user.disabled ? 'Disabled' : 'Active'}
                      </button>
                    </td>
                  </tr>
                ))}
                {usersList.length === 0 && !usersLoading && (
                  <tr>
                    <td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#6B7280' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {usersLoading && (
            <p style={{ color: '#9DA7B7', textAlign: 'center', marginTop: 16 }}>Loading...</p>
          )}

          {usersHasMore && !usersLoading && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => fetchUsers(usersList.length, true)}
                style={styles.button}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div>
          {/* Filter bar */}
          <div style={styles.filterBar}>
            <select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <span style={styles.countLabel}>
              {feedbackTotal} total
            </span>

            <button onClick={handleExportCSV} style={styles.exportButton}>
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Category</th>
                  <th style={{ ...styles.th, minWidth: 200 }}>Feedback</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Screenshot</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((fb) => {
                  const isExpanded = expandedIds.has(fb._id);
                  const needsTruncate = fb.feedback.length > 80;
                  const displayText = (!needsTruncate || isExpanded)
                    ? fb.feedback
                    : fb.feedback.slice(0, 80) + '...';
                  const statusColor = STATUS_COLORS[fb.status] || STATUS_COLORS.open;

                  return (
                    <tr key={fb._id} style={styles.tr}>
                      <td style={styles.td}>{formatDate(fb.created_at)}</td>
                      <td style={styles.td}>
                        {fb.user_id === 'anonymous' ? 'Anonymous' : fb.user_id}
                      </td>
                      <td style={styles.td}>{fb.category}</td>
                      <td style={styles.td}>
                        {displayText}
                        {needsTruncate && (
                          <button
                            onClick={() => toggleExpand(fb._id)}
                            style={styles.expandButton}
                          >
                            {isExpanded ? 'Less' : 'More'}
                          </button>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleStatusToggle(fb._id, fb.status)}
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                          title="Click to cycle status"
                        >
                          {STATUS_LABELS[fb.status] || fb.status}
                        </button>
                      </td>
                      <td style={styles.td}>
                        {fb.has_screenshot ? (
                          <a
                            href={`${BACKEND_URL}/feedback_file/${fb.screenshot_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.viewLink}
                          >
                            View
                          </a>
                        ) : (
                          <span style={{ color: '#6B7280' }}>—</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDeleteFeedback(fb._id)}
                          style={styles.deleteButton}
                          title="Delete feedback"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {feedbackList.length === 0 && !feedbackLoading && (
                  <tr>
                    <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#6B7280' }}>
                      No feedback found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {feedbackLoading && (
            <p style={{ color: '#9DA7B7', textAlign: 'center', marginTop: 16 }}>Loading...</p>
          )}

          {feedbackHasMore && !feedbackLoading && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => fetchFeedback(feedbackList.length, true)}
                style={styles.button}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px 32px',
    backgroundColor: '#0f1729',
    minHeight: '100vh',
    color: '#E5E7EB',
    fontFamily: "'Inter', sans-serif",
  },
  heading: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 20,
    color: '#F9FAFB',
  },
  tabBar: {
    display: 'flex',
    gap: 0,
    marginBottom: 24,
    borderBottom: '1px solid #353E56',
  },
  tab: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#9DA7B7',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  tabActive: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #60a5fa',
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: 10,
    backgroundColor: '#030E29',
    border: '1px solid #353E56',
    borderRadius: 6,
    color: '#E5E7EB',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box' as const,
  },
  button: {
    padding: '8px 18px',
    backgroundColor: '#353E54',
    color: '#E5E7EB',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  filterSelect: {
    padding: '8px 12px',
    backgroundColor: '#17213A',
    border: '1px solid #353E56',
    borderRadius: 6,
    color: '#E5E7EB',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
  },
  countLabel: {
    color: '#6B7280',
    fontSize: 14,
    flex: 1,
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#1e3a5f',
    color: '#60a5fa',
    border: '1px solid #2563eb',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    borderRadius: 8,
    border: '1px solid #253655',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: '#17213A',
    fontSize: 14,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px 14px',
    borderBottom: '1px solid #253655',
    color: '#9DA7B7',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  },
  tr: {
    borderBottom: '1px solid #1e2d4a',
  },
  td: {
    padding: '12px 14px',
    color: '#E5E7EB',
    verticalAlign: 'top' as const,
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: 12,
    border: 'none',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'nowrap' as const,
  },
  expandButton: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    cursor: 'pointer',
    fontSize: 13,
    marginLeft: 6,
    padding: 0,
    fontFamily: "'Inter', sans-serif",
  },
  viewLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
  },
  deleteButton: {
    padding: '4px 10px',
    backgroundColor: '#5f1e1e',
    color: '#fa6060',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'nowrap' as const,
  },
};

export default AdminDashboard;
