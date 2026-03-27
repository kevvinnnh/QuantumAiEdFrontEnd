// src/components/LessonEditor.tsx
// Block-based lesson editor for the admin Content Management tab.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import api, { BACKEND_URL } from '@/api';

function getAxiosErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: string }>(err) && err.response?.data.error) {
    return err.response.data.error;
  }
  return fallback;
}

import type { ContentBlock } from '@/types/lesson';
import type { Question as QuizQuestion } from '@/types/quiz';

interface LessonSummary {
  _id: string;
  courseId: number;
  title: string;
}

interface LessonFull {
  _id: string;
  courseId: number;
  title: string;
  blocks: ContentBlock[];
  quiz: QuizQuestion[];
  interactiveTerms: Record<string, string>;
}

const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading', label: 'Heading' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'image', label: 'Image' },
] as const;

type EditorSection = 'blocks' | 'quiz';

interface LessonEditorProps {
  initialCourseId?: number;
  onBack?: () => void;
}

const LessonEditor: React.FC<LessonEditorProps> = ({ initialCourseId, onBack }) => {
  // Lesson list
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lesson, setLesson] = useState<LessonFull | null>(null);

  // Block editor
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [title, setTitle] = useState('');

  // Quiz editor
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

  // UI state
  const [activeSection, setActiveSection] = useState<EditorSection>('blocks');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [showNewLessonForm, setShowNewLessonForm] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [showReorder, setShowReorder] = useState(false);
  const [reorderList, setReorderList] = useState<LessonSummary[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdx = useRef<number>(-1);

  // Fetch lesson list
  const fetchLessons = useCallback(async () => {
    try {
      const res = await api.get('/api/lessons');
      setLessons(res.data);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  }, []);

  useEffect(() => { void fetchLessons(); }, [fetchLessons]);

  // Pre-select lesson if provided via props
  useEffect(() => {
    if (initialCourseId !== undefined && selectedCourseId === null) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch full lesson when selected
  useEffect(() => {
    if (selectedCourseId === null) {
      setLesson(null);
      setBlocks([]);
      setTitle('');
      setQuiz([]);
      return;
    }
    let cancelled = false;
    api.get(`/api/lessons/${selectedCourseId}`)
      .then(res => {
        if (cancelled) return;
        setLesson(res.data);
        setBlocks(res.data.blocks || []);
        setTitle(res.data.title || '');
        setQuiz(res.data.quiz || []);
      })
      .catch((err: unknown) => {
        console.error('Error fetching lesson:', err);
        setMessage('Failed to load lesson');
      });
    return () => { cancelled = true; };
  }, [selectedCourseId]);

  // --- Block operations ---
  const updateBlock = (idx: number, updates: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, ...updates } : b));
  };

  const removeBlock = (idx: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    setBlocks(prev => {
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = type === 'image'
      ? { type: 'image', fileId: '', caption: '', alt: '', align: 'center', width: 80 }
      : { type, text: '' };
    setBlocks(prev => [...prev, newBlock]);
  };

  // --- Quiz operations ---
  const addQuizQuestion = () => {
    setQuiz(prev => [...prev, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    }]);
  };

  const updateQuizQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };

  const updateQuizOption = (qIdx: number, optIdx: number, value: string) => {
    setQuiz(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[optIdx] = value;
      return { ...q, options };
    }));
  };

  const removeQuizQuestion = (idx: number) => {
    setQuiz(prev => prev.filter((_, i) => i !== idx));
  };

  const moveQuizQuestion = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= quiz.length) return;
    setQuiz(prev => {
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  // --- Image upload ---
  const handleImageUpload = (idx: number) => {
    uploadTargetIdx.current = idx;
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const idx = uploadTargetIdx.current;
    setUploading(idx);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/admin/upload_content_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateBlock(idx, { fileId: res.data.fileId });
      setMessage('Image uploaded');
    } catch (err) {
      console.error('Image upload error:', err);
      setMessage('Image upload failed');
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Save ---
  const handleSave = async () => {
    if (selectedCourseId === null) return;
    setSaving(true);
    setMessage('');
    try {
      await api.put(`/admin/lessons/${selectedCourseId}`, { title, blocks, quiz });
      setMessage('Lesson saved successfully');
      void fetchLessons();
    } catch (err: unknown) {
      setMessage(`Error: ${getAxiosErrorMessage(err, 'Failed to save')}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Create new lesson ---
  const handleCreateLesson = async () => {
    if (!newLessonTitle.trim()) return;
    setMessage('');
    try {
      // Next courseId = max existing + 1
      const maxId = lessons.length > 0 ? Math.max(...lessons.map(l => l.courseId)) : -1;
      await api.post('/admin/lessons', { courseId: maxId + 1, title: newLessonTitle.trim(), blocks: [], quiz: [] });
      setMessage('Lesson created');
      setNewLessonTitle('');
      setShowNewLessonForm(false);
      await fetchLessons();
      setSelectedCourseId(maxId + 1);
    } catch (err: unknown) {
      setMessage(`Error: ${getAxiosErrorMessage(err, 'Failed to create')}`);
    }
  };

  // --- Delete lesson ---
  const handleDeleteLesson = async () => {
    if (selectedCourseId === null) return;
    if (!window.confirm(`Delete lesson "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/lessons/${selectedCourseId}`);
      setMessage('Lesson deleted');
      setSelectedCourseId(null);
      void fetchLessons();
    } catch (err: unknown) {
      setMessage(`Error: ${getAxiosErrorMessage(err, 'Failed to delete')}`);
    }
  };

  // --- Reorder ---
  const startReorder = () => {
    setReorderList([...lessons]);
    setShowReorder(true);
  };

  const moveLesson = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= reorderList.length) return;
    setReorderList(prev => {
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const saveReorder = async () => {
    try {
      await api.post('/admin/lessons/reorder', { order: reorderList.map(l => l.courseId) });
      setMessage('Lessons reordered');
      setShowReorder(false);
      setSelectedCourseId(null);
      void fetchLessons();
    } catch (err: unknown) {
      setMessage(`Error: ${getAxiosErrorMessage(err, 'Failed to reorder')}`);
    }
  };

  // --- Export ---
  const handleExport = async () => {
    try {
      const res = await api.get('/admin/lessons/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'lessons_export.json';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Export error:', err);
      setMessage('Export failed');
    }
  };

  // --- Preview renderer ---
  const renderPreview = () => (
    <div style={previewStyles.container}>
      <h3 style={previewStyles.title}>Preview</h3>
      <div style={previewStyles.content}>
        {blocks.map((block, idx) => {
          if (block.type === 'image') {
            if (!block.fileId) return <div key={idx} style={previewStyles.imagePlaceholder}>No image uploaded</div>;
            return (
              <figure key={idx} role="figure" aria-label={block.alt || block.caption || 'Lesson image'}
                style={{ display: 'flex', flexDirection: 'column', alignItems: block.align === 'left' ? 'flex-start' : block.align === 'right' ? 'flex-end' : 'center', margin: '24px 0', userSelect: 'none' }}>
                <img src={`${BACKEND_URL}/file/${block.fileId}`} alt="" aria-hidden="true" style={{ maxWidth: `${block.width || 80}%`, borderRadius: 8, objectFit: 'contain' }} draggable={false} />
                {block.caption && <figcaption style={{ marginTop: 8, fontSize: '0.9rem', color: '#aab4c8', fontStyle: 'italic' }}>{block.caption}</figcaption>}
              </figure>
            );
          }
          const text = block.text || '';
          if (block.type === 'heading') return <h3 key={idx} style={previewStyles.heading}>{text}</h3>;
          if (block.type === 'subheading') return <h4 key={idx} style={previewStyles.subheading}>{text}</h4>;
          return <p key={idx} style={previewStyles.paragraph}>{text}</p>;
        })}
        {blocks.length === 0 && <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No content blocks yet.</p>}
      </div>
    </div>
  );

  // --- Reorder modal ---
  if (showReorder) {
    return (
      <div>
        <h3 style={{ color: '#F9FAFB', marginBottom: 16 }}>Reorder Lessons</h3>
        <p style={{ color: '#9DA7B7', fontSize: 13, marginBottom: 12 }}>
          Drag order determines courseId and display order in the dashboard.
        </p>
        {reorderList.map((l, idx) => (
          <div key={l._id} style={editorStyles.reorderItem}>
            <span style={{ color: '#6B7280', fontSize: 12, width: 24, textAlign: 'center' }}>{idx}</span>
            <span style={{ flex: 1, color: '#E5E7EB' }}>{l.title}</span>
            <button onClick={() => moveLesson(idx, -1)} disabled={idx === 0} style={editorStyles.iconBtn} title="Move up">&#9650;</button>
            <button onClick={() => moveLesson(idx, 1)} disabled={idx === reorderList.length - 1} style={editorStyles.iconBtn} title="Move down">&#9660;</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => { void saveReorder(); }} style={editorStyles.saveBtn}>Save Order</button>
          <button onClick={() => setShowReorder(false)} style={editorStyles.cancelBtn}>Cancel</button>
        </div>
        {message && <span style={{ color: message.startsWith('Error') ? '#fa6060' : '#4ade80', fontSize: 14, marginLeft: 12 }}>{message}</span>}
      </div>
    );
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { void onFileSelected(e); }} />

      {/* Top action bar */}
      <div style={editorStyles.topBar}>
        {onBack && (
          <button onClick={onBack} style={editorStyles.actionBtn} title="Back to dashboard manager">&larr; Back</button>
        )}
        <select
          value={selectedCourseId ?? ''}
          onChange={e => setSelectedCourseId(e.target.value === '' ? null : Number(e.target.value))}
          style={{ ...editorStyles.select, flex: 1 }}
        >
          <option value="">Select a lesson to edit...</option>
          {lessons.map(l => (
            <option key={l.courseId} value={l.courseId}>
              Lesson {l.courseId}: {l.title}
            </option>
          ))}
        </select>

        <button onClick={() => setShowNewLessonForm(v => !v)} style={editorStyles.actionBtn} title="New lesson">
          + New
        </button>
        <button onClick={startReorder} style={editorStyles.actionBtn} title="Reorder lessons" disabled={lessons.length < 2}>
          Reorder
        </button>
        <button onClick={() => { void handleExport(); }} style={editorStyles.actionBtn} title="Export all lessons as JSON">
          Export
        </button>

        {selectedCourseId !== null && (
          <label style={editorStyles.previewToggle}>
            <input type="checkbox" checked={showPreview} onChange={e => setShowPreview(e.target.checked)} />
            <span style={{ marginLeft: 6 }}>Preview</span>
          </label>
        )}
      </div>

      {/* New lesson form */}
      {showNewLessonForm && (
        <div style={editorStyles.newLessonBar}>
          <input
            value={newLessonTitle}
            onChange={e => setNewLessonTitle(e.target.value)}
            placeholder="New lesson title..."
            style={{ ...editorStyles.input, flex: 1, marginBottom: 0 }}
            onKeyDown={e => { if (e.key === 'Enter') void handleCreateLesson(); }}
          />
          <button onClick={() => { void handleCreateLesson(); }} style={editorStyles.saveBtn} disabled={!newLessonTitle.trim()}>Create</button>
          <button onClick={() => setShowNewLessonForm(false)} style={editorStyles.cancelBtn}>Cancel</button>
        </div>
      )}

      {/* Message bar */}
      {message && (
        <div style={{ padding: '8px 14px', marginBottom: 12, borderRadius: 6, fontSize: 13, backgroundColor: message.startsWith('Error') ? '#3b1a1a' : '#1a3b2a', color: message.startsWith('Error') ? '#fa6060' : '#4ade80' }}>
          {message}
        </div>
      )}

      {selectedCourseId !== null && lesson && (
        <>
          {/* Title + delete */}
          <div style={editorStyles.titleRow}>
            <div style={{ flex: 1 }}>
              <label style={editorStyles.label}>Lesson Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={editorStyles.titleInput} />
            </div>
            <button onClick={() => { void handleDeleteLesson(); }} style={editorStyles.deleteBtn} title="Delete this lesson">
              Delete Lesson
            </button>
          </div>

          {/* Section tabs */}
          <div style={editorStyles.sectionTabs}>
            <button
              style={activeSection === 'blocks' ? editorStyles.sectionTabActive : editorStyles.sectionTab}
              onClick={() => setActiveSection('blocks')}
            >
              Content ({blocks.length} blocks)
            </button>
            <button
              style={activeSection === 'quiz' ? editorStyles.sectionTabActive : editorStyles.sectionTab}
              onClick={() => setActiveSection('quiz')}
            >
              Quiz ({quiz.length} questions)
            </button>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              {/* === BLOCKS EDITOR === */}
              {activeSection === 'blocks' && (
                <>
                  {blocks.map((block, idx) => (
                    <div key={idx} style={editorStyles.blockCard}>
                      <div style={editorStyles.blockHeader}>
                        <span style={editorStyles.blockType}>{block.type.toUpperCase()}</span>
                        <div style={editorStyles.blockActions}>
                          <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} style={editorStyles.iconBtn} title="Move up">&#9650;</button>
                          <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1} style={editorStyles.iconBtn} title="Move down">&#9660;</button>
                          <button onClick={() => removeBlock(idx)} style={{ ...editorStyles.iconBtn, color: '#fa6060' }} title="Delete">&#10005;</button>
                        </div>
                      </div>

                      {block.type === 'image' ? (
                        <div style={editorStyles.imageEditor}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <button onClick={() => handleImageUpload(idx)} style={editorStyles.uploadBtn} disabled={uploading === idx}>
                              {uploading === idx ? 'Uploading...' : block.fileId ? 'Replace Image' : 'Upload Image'}
                            </button>
                            {block.fileId && <img src={`${BACKEND_URL}/file/${block.fileId}`} alt="preview" style={{ height: 40, borderRadius: 4, objectFit: 'contain' }} />}
                          </div>
                          <input placeholder="Caption (shown below image)" value={block.caption || ''} onChange={e => updateBlock(idx, { caption: e.target.value })} style={editorStyles.input} />
                          <input placeholder="Alt text (for accessibility)" value={block.alt || ''} onChange={e => updateBlock(idx, { alt: e.target.value })} style={editorStyles.input} />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select value={block.align || 'center'} onChange={e => { const v = e.target.value; if (v === 'center' || v === 'left' || v === 'right') updateBlock(idx, { align: v }); }} style={{ ...editorStyles.input, flex: 1 }}>
                              <option value="center">Center</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                            </select>
                            <input type="number" min={20} max={100} value={block.width ?? 80} onChange={e => updateBlock(idx, { width: Number(e.target.value) })} style={{ ...editorStyles.input, flex: 1 }} placeholder="Width %" />
                          </div>
                        </div>
                      ) : (
                        <textarea
                          value={block.text || ''}
                          onChange={e => updateBlock(idx, { text: e.target.value })}
                          style={{ ...editorStyles.blockTextarea, fontWeight: block.type === 'heading' ? 600 : block.type === 'subheading' ? 500 : 400, fontSize: block.type === 'heading' ? 16 : block.type === 'subheading' ? 15 : 14 }}
                          rows={block.type === 'paragraph' ? 3 : 1}
                        />
                      )}
                    </div>
                  ))}

                  <div style={editorStyles.addBar}>
                    {BLOCK_TYPES.map(bt => (
                      <button key={bt.value} onClick={() => addBlock(bt.value)} style={editorStyles.addBtn}>+ {bt.label}</button>
                    ))}
                  </div>
                </>
              )}

              {/* === QUIZ EDITOR === */}
              {activeSection === 'quiz' && (
                <>
                  {quiz.map((q, qIdx) => (
                    <div key={qIdx} style={editorStyles.blockCard}>
                      <div style={editorStyles.blockHeader}>
                        <span style={editorStyles.blockType}>QUESTION {qIdx + 1}</span>
                        <div style={editorStyles.blockActions}>
                          <button onClick={() => moveQuizQuestion(qIdx, -1)} disabled={qIdx === 0} style={editorStyles.iconBtn} title="Move up">&#9650;</button>
                          <button onClick={() => moveQuizQuestion(qIdx, 1)} disabled={qIdx === quiz.length - 1} style={editorStyles.iconBtn} title="Move down">&#9660;</button>
                          <button onClick={() => removeQuizQuestion(qIdx)} style={{ ...editorStyles.iconBtn, color: '#fa6060' }} title="Delete">&#10005;</button>
                        </div>
                      </div>

                      <textarea
                        value={q.question}
                        onChange={e => updateQuizQuestion(qIdx, { question: e.target.value })}
                        placeholder="Question text..."
                        style={{ ...editorStyles.blockTextarea, marginBottom: 8 }}
                        rows={2}
                      />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => updateQuizQuestion(qIdx, { correctAnswer: optIdx })}
                              title="Mark as correct answer"
                            />
                            <input
                              value={opt}
                              onChange={e => updateQuizOption(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              style={{ ...editorStyles.input, flex: 1, marginBottom: 0 }}
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        value={q.explanation || ''}
                        onChange={e => updateQuizQuestion(qIdx, { explanation: e.target.value })}
                        placeholder="Explanation (shown after answering)"
                        style={editorStyles.input}
                      />
                    </div>
                  ))}

                  <button onClick={addQuizQuestion} style={editorStyles.addBtn}>+ Add Question</button>
                </>
              )}

              {/* Save bar */}
              <div style={editorStyles.saveBar}>
                <button onClick={() => { void handleSave(); }} disabled={saving} style={editorStyles.saveBtn}>
                  {saving ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </div>

            {/* Preview */}
            {showPreview && activeSection === 'blocks' && (
              <div style={{ flex: 1, maxWidth: '50%' }}>{renderPreview()}</div>
            )}
          </div>
        </>
      )}

      {selectedCourseId === null && !showNewLessonForm && (
        <p style={{ color: '#6B7280', marginTop: 16 }}>Select a lesson above to edit, or create a new one.</p>
      )}
    </div>
  );
};

const editorStyles: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  select: {
    padding: '10px 12px',
    backgroundColor: '#030E29',
    border: '1px solid #353E56',
    borderRadius: 6,
    color: '#E5E7EB',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
  },
  actionBtn: {
    padding: '8px 14px',
    backgroundColor: '#253655',
    color: '#9DA7B7',
    border: '1px solid #353E56',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'nowrap' as const,
  },
  previewToggle: {
    display: 'flex',
    alignItems: 'center',
    color: '#9DA7B7',
    fontSize: 14,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  newLessonBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    padding: '12px 14px',
    backgroundColor: '#17213A',
    border: '1px solid #253655',
    borderRadius: 6,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: '#9DA7B7',
    marginBottom: 4,
  },
  titleInput: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#030E29',
    border: '1px solid #353E56',
    borderRadius: 6,
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box' as const,
  },
  deleteBtn: {
    padding: '8px 14px',
    backgroundColor: '#5f1e1e',
    color: '#fa6060',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'nowrap' as const,
  },
  sectionTabs: {
    display: 'flex',
    gap: 0,
    marginBottom: 16,
    borderBottom: '1px solid #353E56',
  },
  sectionTab: {
    padding: '8px 18px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#9DA7B7',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  sectionTabActive: {
    padding: '8px 18px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #60a5fa',
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  blockCard: {
    marginBottom: 8,
    padding: '10px 14px',
    backgroundColor: '#17213A',
    border: '1px solid #253655',
    borderRadius: 6,
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  blockType: {
    fontSize: 11,
    fontWeight: 700,
    color: '#60a5fa',
    letterSpacing: 1,
  },
  blockActions: {
    display: 'flex',
    gap: 4,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#9DA7B7',
    cursor: 'pointer',
    fontSize: 12,
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: "'Inter', sans-serif",
  },
  blockTextarea: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: '#030E29',
    border: '1px solid #253655',
    borderRadius: 4,
    color: '#E5E7EB',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
  },
  imageEditor: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  uploadBtn: {
    padding: '6px 14px',
    backgroundColor: '#1e3a5f',
    color: '#60a5fa',
    border: '1px solid #2563eb',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
  },
  input: {
    padding: '8px 10px',
    backgroundColor: '#030E29',
    border: '1px solid #253655',
    borderRadius: 4,
    color: '#E5E7EB',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box' as const,
  },
  addBar: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
    flexWrap: 'wrap' as const,
  },
  addBtn: {
    padding: '6px 14px',
    backgroundColor: '#253655',
    color: '#9DA7B7',
    border: '1px solid #353E56',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
  },
  saveBar: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtn: {
    padding: '10px 24px',
    backgroundColor: '#1a3b2a',
    color: '#4ade80',
    border: '1px solid #166534',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  cancelBtn: {
    padding: '8px 14px',
    backgroundColor: '#253655',
    color: '#9DA7B7',
    border: '1px solid #353E56',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
  },
  reorderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    marginBottom: 4,
    backgroundColor: '#17213A',
    border: '1px solid #253655',
    borderRadius: 6,
  },
};

const previewStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#0f1729',
    border: '1px solid #253655',
    borderRadius: 8,
    padding: 20,
    position: 'sticky' as const,
    top: 20,
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto' as const,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#9DA7B7',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '1px solid #253655',
  },
  content: {
    color: '#FFFFFF',
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    lineHeight: 1.5,
  },
  heading: {
    fontSize: '1.3rem',
    fontWeight: 600,
    letterSpacing: '0.75px',
    marginTop: 24,
    marginBottom: 12,
    color: '#FFFFFF',
  },
  subheading: {
    fontSize: '1.1rem',
    fontWeight: 500,
    letterSpacing: '0.75px',
    marginTop: 18,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  paragraph: {
    marginBottom: 18,
    color: '#FFFFFF',
  },
  imagePlaceholder: {
    padding: 24,
    margin: '16px 0',
    backgroundColor: '#17213A',
    border: '2px dashed #353E56',
    borderRadius: 8,
    textAlign: 'center' as const,
    color: '#6B7280',
    fontStyle: 'italic',
  },
};

export default LessonEditor;
