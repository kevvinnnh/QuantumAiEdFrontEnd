// src/components/AdminDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
  const [activeTab, setActiveTab] = useState<'content' | 'feedback'>('content');

  // Content management state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [readingTitle, setReadingTitle] = useState('');
  const [readingContent, setReadingContent] = useState('');
  const [quizData, setQuizData] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  // Feedback state
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState('');
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackHasMore, setFeedbackHasMore] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Content management handlers
  const handleUploadLesson = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/admin/upload_lesson`,
        { title: lessonTitle, description: lessonDescription },
        { withCredentials: true }
      );
      setUploadMessage(response.data.message);
    } catch (error) {
      setUploadMessage('Error uploading lesson');
      console.error(error);
    }
  };

  const handleUploadReading = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', readingTitle);
    formData.append('content', readingContent);
    try {
      const response = await axios.post(
        `${backendUrl}/admin/upload_reading`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUploadMessage(response.data.message);
    } catch (error) {
      setUploadMessage('Error uploading reading');
      console.error(error);
    }
  };

  const handleUploadQuiz = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/admin/upload_quiz`,
        { questions: JSON.parse(quizData) },
        { withCredentials: true }
      );
      setUploadMessage(response.data.message);
    } catch (error) {
      setUploadMessage('Error uploading quiz');
      console.error(error);
    }
  };

  // Feedback handlers
  const fetchFeedback = useCallback(async (skip = 0, append = false) => {
    setFeedbackLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', skip: String(skip) });
      if (feedbackFilter) params.set('status', feedbackFilter);

      const response = await axios.get(
        `${backendUrl}/admin/feedback?${params.toString()}`,
        { withCredentials: true }
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
      await axios.patch(
        `${backendUrl}/admin/feedback/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setFeedbackList(prev =>
        prev.map(fb => fb._id === id ? { ...fb, status: newStatus } : fb)
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (feedbackFilter) params.set('status', feedbackFilter);
      const url = `${backendUrl}/admin/feedback/export?${params.toString()}`;

      const response = await axios.get(url, {
        withCredentials: true,
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
        <div>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Upload Lesson</h2>
            <input
              type="text"
              placeholder="Lesson Title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              style={styles.input}
            />
            <textarea
              placeholder="Lesson Description"
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              style={styles.textarea}
            />
            <button onClick={handleUploadLesson} style={styles.button}>
              Upload Lesson
            </button>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Upload Reading</h2>
            <form onSubmit={handleUploadReading}>
              <input
                type="text"
                placeholder="Reading Title"
                value={readingTitle}
                onChange={(e) => setReadingTitle(e.target.value)}
                style={styles.input}
              />
              <textarea
                placeholder="Reading Content"
                value={readingContent}
                onChange={(e) => setReadingContent(e.target.value)}
                style={styles.textarea}
              />
              <input type="file" name="image" style={{ marginBottom: '10px' }} />
              <input type="file" name="video" style={{ marginBottom: '10px' }} />
              <button type="submit" style={styles.button}>
                Upload Reading
              </button>
            </form>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Upload Quiz</h2>
            <textarea
              placeholder='Enter quiz JSON (e.g., [{"question": "Q?", "options": ["A", "B", "C", "D"], "correctAnswer": 0}, ...])'
              value={quizData}
              onChange={(e) => setQuizData(e.target.value)}
              style={{ ...styles.textarea, height: '150px' }}
            />
            <button onClick={handleUploadQuiz} style={styles.button}>
              Upload Quiz
            </button>
          </section>

          {uploadMessage && (
            <div style={styles.messageBox}>
              {uploadMessage}
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
                            href={`${backendUrl}/feedback_file/${fb.screenshot_id}`}
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
                    </tr>
                  );
                })}
                {feedbackList.length === 0 && !feedbackLoading && (
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#6B7280' }}>
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
  section: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#17213A',
    borderRadius: 8,
    border: '1px solid #253655',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 12,
    color: '#F9FAFB',
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
  textarea: {
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
    resize: 'vertical' as const,
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
  messageBox: {
    marginTop: 16,
    padding: '10px 14px',
    backgroundColor: '#1a3b2a',
    color: '#4ade80',
    borderRadius: 6,
    fontSize: 14,
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
};

export default AdminDashboard;
