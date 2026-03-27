// src/components/ContentManager.tsx
// Top-level Content Management view for the admin dashboard.
// Shows dashboard structure (sections, courses, topics) and drills into LessonEditor.

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api';
import LessonEditor from './LessonEditor';

// --- Types ---

interface Topic {
  id: number;
  title: string;
  description: string;
  implemented: boolean;
}

interface Concept {
  id: string;
  title: string;
  topics: Topic[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  concepts: Concept[];
}

interface Section {
  id: string;
  title: string;
  order: number;
  courses: number[]; // course ids
}

interface DashboardConfig {
  sections: Section[];
  courses: Course[];
}

type ContentView = 'overview' | 'lesson-editor';

// Image options for course cards
const IMAGE_OPTIONS = [
  { value: 'lesson-0', label: 'Quantum Blue' },
  { value: 'lesson-1', label: 'Quantum Purple' },
  { value: 'lesson-2', label: 'Quantum Green' },
];

const ContentManager: React.FC = () => {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [contentView, setContentView] = useState<ContentView>('overview');
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  // Editing state for sections
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');

  // Editing state for inline course card editing
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  // New section form
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // New course form
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseSection, setNewCourseSection] = useState('');

  const fetchConfig = useCallback(async () => {
    try {
      const res = await api.get('/admin/dashboard-config');
      setConfig(res.data);
    } catch (err) {
      console.error('Error fetching dashboard config:', err);
      setMessage('Failed to load dashboard config');
    }
  }, []);

  useEffect(() => { void fetchConfig(); }, [fetchConfig]);

  // --- Save ---
  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage('');
    try {
      await api.put('/admin/dashboard-config', { sections: config.sections, courses: config.courses });
      setMessage('Dashboard config saved');
    } catch (err: unknown) {
      let msg = 'Failed to save';
      if (axios.isAxiosError<{ error?: string }>(err) && err.response?.data.error) {
        msg = err.response.data.error;
      }
      setMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Section operations ---
  const addSection = () => {
    if (!newSectionTitle.trim() || !config) return;
    const id = newSectionTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSection: Section = {
      id: id || `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      order: config.sections.length,
      courses: [],
    };
    setConfig({ ...config, sections: [...config.sections, newSection] });
    setNewSectionTitle('');
    setShowNewSection(false);
  };

  const removeSection = (sectionId: string) => {
    if (!config) return;
    const section = config.sections.find(s => s.id === sectionId);
    if (section && section.courses.length > 0) {
      if (!window.confirm(`Section "${section.title}" has ${section.courses.length} course(s). Remove section and unassign its courses?`)) return;
    }
    setConfig({ ...config, sections: config.sections.filter(s => s.id !== sectionId) });
  };

  const moveSection = (idx: number, direction: -1 | 1) => {
    if (!config) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= config.sections.length) return;
    const sections = [...config.sections];
    [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
    sections.forEach((s, i) => s.order = i);
    setConfig({ ...config, sections });
  };

  const renameSectionStart = (section: Section) => {
    setEditingSectionId(section.id);
    setEditingSectionTitle(section.title);
  };

  const renameSectionSave = () => {
    if (!config || !editingSectionId) return;
    setConfig({
      ...config,
      sections: config.sections.map(s =>
        s.id === editingSectionId ? { ...s, title: editingSectionTitle.trim() || s.title } : s
      ),
    });
    setEditingSectionId(null);
  };

  // --- Course operations ---
  const getCourse = (courseId: number): Course | undefined => config?.courses.find(c => c.id === courseId);

  const updateCourse = (courseId: number, updates: Partial<Course>) => {
    if (!config) return;
    setConfig({
      ...config,
      courses: config.courses.map(c => c.id === courseId ? { ...c, ...updates } : c),
    });
  };

  const addCourse = () => {
    if (!newCourseTitle.trim() || !config) return;
    const maxId = config.courses.length > 0 ? Math.max(...config.courses.map(c => c.id)) : -1;
    const newId = maxId + 1;
    const newCourse: Course = {
      id: newId,
      title: newCourseTitle.trim(),
      description: newCourseDesc.trim(),
      image: 'lesson-0',
      concepts: [
        {
          id: `concept-${newId}-0`,
          title: newCourseTitle.trim(),
          topics: [
            { id: newId, title: newCourseTitle.trim(), description: newCourseDesc.trim(), implemented: false },
          ],
        },
      ],
    };
    const courses = [...config.courses, newCourse];
    let sections = config.sections;
    if (newCourseSection) {
      sections = sections.map(s =>
        s.id === newCourseSection ? { ...s, courses: [...s.courses, newId] } : s
      );
    }
    setConfig({ ...config, courses, sections });
    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseSection('');
    setShowNewCourse(false);
  };

  const removeCourse = (courseId: number) => {
    if (!config) return;
    const course = getCourse(courseId);
    if (!window.confirm(`Delete course "${course?.title}"? This removes it from all sections.`)) return;
    setConfig({
      ...config,
      courses: config.courses.filter(c => c.id !== courseId),
      sections: config.sections.map(s => ({ ...s, courses: s.courses.filter(id => id !== courseId) })),
    });
  };

  const moveCourseInSection = (sectionId: string, idx: number, direction: -1 | 1) => {
    if (!config) return;
    const newIdx = idx + direction;
    setConfig({
      ...config,
      sections: config.sections.map(s => {
        if (s.id !== sectionId) return s;
        if (newIdx < 0 || newIdx >= s.courses.length) return s;
        const courses = [...s.courses];
        [courses[idx], courses[newIdx]] = [courses[newIdx], courses[idx]];
        return { ...s, courses };
      }),
    });
  };

  const moveCourseToSection = (courseId: number, fromSectionId: string, toSectionId: string) => {
    if (!config || fromSectionId === toSectionId) return;
    setConfig({
      ...config,
      sections: config.sections.map(s => {
        if (s.id === fromSectionId) return { ...s, courses: s.courses.filter(id => id !== courseId) };
        if (s.id === toSectionId) return { ...s, courses: [...s.courses, courseId] };
        return s;
      }),
    });
  };

  // --- Concept operations ---
  const addConcept = (courseId: number) => {
    if (!config) return;
    const course = getCourse(courseId);
    if (!course) return;
    const newConcept: Concept = {
      id: `concept-${courseId}-${course.concepts.length}`,
      title: 'New Concept',
      topics: [],
    };
    updateCourse(courseId, { concepts: [...course.concepts, newConcept] });
  };

  const updateConcept = (courseId: number, conceptId: string, updates: Partial<Concept>) => {
    if (!config) return;
    const course = getCourse(courseId);
    if (!course) return;
    updateCourse(courseId, {
      concepts: course.concepts.map(c => c.id === conceptId ? { ...c, ...updates } : c),
    });
  };

  const removeConcept = (courseId: number, conceptId: string) => {
    if (!config) return;
    const course = getCourse(courseId);
    if (!course) return;
    updateCourse(courseId, { concepts: course.concepts.filter(c => c.id !== conceptId) });
  };

  // --- Topic operations ---
  const addTopic = (courseId: number, conceptId: string) => {
    if (!config) return;
    const course = getCourse(courseId);
    if (!course) return;
    // Find next available topic id
    const allTopicIds = config.courses.flatMap(c => c.concepts.flatMap(con => con.topics.map(t => t.id)));
    const maxTopicId = allTopicIds.length > 0 ? Math.max(...allTopicIds) : -1;
    const newTopic: Topic = {
      id: maxTopicId + 1,
      title: 'New Topic',
      description: '',
      implemented: false,
    };
    updateCourse(courseId, {
      concepts: course.concepts.map(c =>
        c.id === conceptId ? { ...c, topics: [...c.topics, newTopic] } : c
      ),
    });
  };

  const updateTopic = (courseId: number, conceptId: string, topicId: number, updates: Partial<Topic>) => {
    if (!config) return;
    const course = getCourse(courseId);
    if (!course) return;
    updateCourse(courseId, {
      concepts: course.concepts.map(c =>
        c.id === conceptId
          ? { ...c, topics: c.topics.map(t => t.id === topicId ? { ...t, ...updates } : t) }
          : c
      ),
    });
  };

  const removeTopic = (courseId: number, conceptId: string, topicId: number) => {
    if (!config) return;
    const course = getCourse(courseId);
    if (!course) return;
    updateCourse(courseId, {
      concepts: course.concepts.map(c =>
        c.id === conceptId ? { ...c, topics: c.topics.filter(t => t.id !== topicId) } : c
      ),
    });
  };

  // --- Toggle expand ---
  const toggleExpand = (courseId: number) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  // --- Drill into lesson editor ---
  const openLessonEditor = (courseId: number) => {
    setEditingCourseId(courseId);
    setContentView('lesson-editor');
  };

  // --- Unassigned courses ---
  const getUnassignedCourses = (): Course[] => {
    if (!config) return [];
    const assigned = new Set(config.sections.flatMap(s => s.courses));
    return config.courses.filter(c => !assigned.has(c.id));
  };

  // === LESSON EDITOR VIEW ===
  if (contentView === 'lesson-editor') {
    return (
      <LessonEditor
        initialCourseId={editingCourseId ?? undefined}
        onBack={() => { setContentView('overview'); setEditingCourseId(null); }}
      />
    );
  }

  // === OVERVIEW VIEW ===
  if (!config) {
    return <p style={{ color: '#9DA7B7' }}>Loading dashboard config...</p>;
  }

  const unassigned = getUnassignedCourses();

  return (
    <div>
      {/* Top bar */}
      <div style={s.topBar}>
        <h3 style={s.pageTitle}>Dashboard Structure</h3>
        <div style={s.topBarActions}>
          <button onClick={() => setShowNewSection(true)} style={s.actionBtn}>+ Section</button>
          <button onClick={() => setShowNewCourse(true)} style={s.actionBtn}>+ Course</button>
          <button onClick={() => { void handleSave(); }} disabled={saving} style={s.saveBtn}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: '8px 14px', marginBottom: 12, borderRadius: 6, fontSize: 13, backgroundColor: message.startsWith('Error') ? '#3b1a1a' : '#1a3b2a', color: message.startsWith('Error') ? '#fa6060' : '#4ade80' }}>
          {message}
        </div>
      )}

      {/* New section form */}
      {showNewSection && (
        <div style={s.formBar}>
          <input
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            placeholder="Section title..."
            style={{ ...s.input, flex: 1 }}
            onKeyDown={e => e.key === 'Enter' && addSection()}
            autoFocus
          />
          <button onClick={addSection} style={s.saveBtn} disabled={!newSectionTitle.trim()}>Create</button>
          <button onClick={() => setShowNewSection(false)} style={s.cancelBtn}>Cancel</button>
        </div>
      )}

      {/* New course form */}
      {showNewCourse && (
        <div style={s.formBar}>
          <input
            value={newCourseTitle}
            onChange={e => setNewCourseTitle(e.target.value)}
            placeholder="Course title..."
            style={{ ...s.input, flex: 1 }}
            autoFocus
          />
          <input
            value={newCourseDesc}
            onChange={e => setNewCourseDesc(e.target.value)}
            placeholder="Description..."
            style={{ ...s.input, flex: 1 }}
          />
          <select
            value={newCourseSection}
            onChange={e => setNewCourseSection(e.target.value)}
            style={{ ...s.input, width: 160 }}
          >
            <option value="">No section</option>
            {config.sections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.title}</option>
            ))}
          </select>
          <button onClick={addCourse} style={s.saveBtn} disabled={!newCourseTitle.trim()}>Create</button>
          <button onClick={() => setShowNewCourse(false)} style={s.cancelBtn}>Cancel</button>
        </div>
      )}

      {/* Sections */}
      {config.sections.map((section, sIdx) => (
        <div key={section.id} style={s.sectionCard}>
          {/* Section header */}
          <div style={s.sectionHeader}>
            {editingSectionId === section.id ? (
              <input
                value={editingSectionTitle}
                onChange={e => setEditingSectionTitle(e.target.value)}
                onBlur={renameSectionSave}
                onKeyDown={e => e.key === 'Enter' && renameSectionSave()}
                style={{ ...s.input, fontSize: 15, fontWeight: 600, flex: 1 }}
                autoFocus
              />
            ) : (
              <h4
                style={s.sectionTitle}
                onDoubleClick={() => renameSectionStart(section)}
                title="Double-click to rename"
              >
                {section.title}
              </h4>
            )}
            <div style={s.sectionActions}>
              <span style={s.courseCount}>{section.courses.length} course(s)</span>
              <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} style={s.iconBtn} title="Move up">&#9650;</button>
              <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === config.sections.length - 1} style={s.iconBtn} title="Move down">&#9660;</button>
              <button onClick={() => renameSectionStart(section)} style={s.iconBtn} title="Rename">&#9998;</button>
              <button onClick={() => removeSection(section.id)} style={{ ...s.iconBtn, color: '#fa6060' }} title="Remove section">&#10005;</button>
            </div>
          </div>

          {/* Course cards in section */}
          {section.courses.length === 0 && (
            <p style={s.emptyText}>No courses in this section. Add courses or move them here.</p>
          )}
          {section.courses.map((courseId, cIdx) => {
            const course = getCourse(courseId);
            if (!course) return <div key={courseId} style={s.courseCard}><span style={{ color: '#fa6060' }}>Course {courseId} not found</span></div>;
            const isExpanded = expandedCourses.has(courseId);
            const isEditing = editingCardId === courseId;

            return (
              <div key={courseId} style={s.courseCard}>
                {/* Course card header */}
                <div style={s.courseHeader}>
                  <button onClick={() => toggleExpand(courseId)} style={s.expandBtn}>
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input
                          value={course.title}
                          onChange={e => updateCourse(courseId, { title: e.target.value })}
                          style={{ ...s.input, fontWeight: 600 }}
                        />
                        <input
                          value={course.description}
                          onChange={e => updateCourse(courseId, { description: e.target.value })}
                          style={s.input}
                          placeholder="Description..."
                        />
                        <select
                          value={course.image}
                          onChange={e => updateCourse(courseId, { image: e.target.value })}
                          style={{ ...s.input, width: 180 }}
                        >
                          {IMAGE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button onClick={() => setEditingCardId(null)} style={{ ...s.cancelBtn, alignSelf: 'flex-start' }}>Done</button>
                      </div>
                    ) : (
                      <>
                        <span style={s.courseTitle}>{course.title}</span>
                        <span style={s.courseDesc}>{course.description}</span>
                      </>
                    )}
                  </div>
                  <div style={s.courseActions}>
                    <button onClick={() => moveCourseInSection(section.id, cIdx, -1)} disabled={cIdx === 0} style={s.iconBtn} title="Move up">&#9650;</button>
                    <button onClick={() => moveCourseInSection(section.id, cIdx, 1)} disabled={cIdx === section.courses.length - 1} style={s.iconBtn} title="Move down">&#9660;</button>
                    <select
                      value={section.id}
                      onChange={e => moveCourseToSection(courseId, section.id, e.target.value)}
                      style={{ ...s.input, width: 120, fontSize: 11, padding: '2px 4px' }}
                      title="Move to section"
                    >
                      {config.sections.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.title}</option>
                      ))}
                    </select>
                    <button onClick={() => setEditingCardId(isEditing ? null : courseId)} style={s.iconBtn} title="Edit card">&#9998;</button>
                    <button onClick={() => openLessonEditor(courseId)} style={s.editContentBtn} title="Edit lesson content">Content</button>
                    <button onClick={() => removeCourse(courseId)} style={{ ...s.iconBtn, color: '#fa6060' }} title="Delete course">&#10005;</button>
                  </div>
                </div>

                {/* Expanded: concepts & topics */}
                {isExpanded && (
                  <div style={s.conceptsArea}>
                    {course.concepts.map(concept => (
                      <div key={concept.id} style={s.conceptCard}>
                        <div style={s.conceptHeader}>
                          <input
                            value={concept.title}
                            onChange={e => updateConcept(courseId, concept.id, { title: e.target.value })}
                            style={{ ...s.input, flex: 1, fontWeight: 500, fontSize: 13 }}
                            placeholder="Concept title..."
                          />
                          <button onClick={() => removeConcept(courseId, concept.id)} style={{ ...s.iconBtn, color: '#fa6060' }} title="Remove concept">&#10005;</button>
                        </div>
                        {concept.topics.map(topic => (
                          <div key={topic.id} style={s.topicRow}>
                            <label style={s.implementedLabel} title="Is this topic implemented?">
                              <input
                                type="checkbox"
                                checked={topic.implemented}
                                onChange={e => updateTopic(courseId, concept.id, topic.id, { implemented: e.target.checked })}
                              />
                            </label>
                            <input
                              value={topic.title}
                              onChange={e => updateTopic(courseId, concept.id, topic.id, { title: e.target.value })}
                              style={{ ...s.input, flex: 1, fontSize: 12 }}
                              placeholder="Topic title..."
                            />
                            <input
                              value={topic.description}
                              onChange={e => updateTopic(courseId, concept.id, topic.id, { description: e.target.value })}
                              style={{ ...s.input, flex: 1, fontSize: 12 }}
                              placeholder="Description..."
                            />
                            <span style={s.topicIdBadge}>ID: {topic.id}</span>
                            <button onClick={() => openLessonEditor(topic.id)} style={s.editContentBtn} title="Edit this topic's lesson content">Edit</button>
                            <button onClick={() => removeTopic(courseId, concept.id, topic.id)} style={{ ...s.iconBtn, color: '#fa6060' }}>&#10005;</button>
                          </div>
                        ))}
                        <button onClick={() => addTopic(courseId, concept.id)} style={s.addBtn}>+ Topic</button>
                      </div>
                    ))}
                    <button onClick={() => addConcept(courseId)} style={s.addBtn}>+ Concept</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Unassigned courses */}
      {unassigned.length > 0 && (
        <div style={{ ...s.sectionCard, borderColor: '#5f4e1e' }}>
          <div style={s.sectionHeader}>
            <h4 style={{ ...s.sectionTitle, color: '#f5c542' }}>Unassigned Courses</h4>
            <span style={s.courseCount}>{unassigned.length} course(s) not in any section</span>
          </div>
          {unassigned.map(course => (
            <div key={course.id} style={s.courseCard}>
              <div style={s.courseHeader}>
                <div style={{ flex: 1 }}>
                  <span style={s.courseTitle}>{course.title}</span>
                </div>
                <div style={s.courseActions}>
                  <select
                    value=""
                    onChange={e => {
                      if (!e.target.value) return;
                      setConfig({
                        ...config,
                        sections: config.sections.map(sec =>
                          sec.id === e.target.value ? { ...sec, courses: [...sec.courses, course.id] } : sec
                        ),
                      });
                    }}
                    style={{ ...s.input, width: 140, fontSize: 11 }}
                  >
                    <option value="">Assign to section...</option>
                    {config.sections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.title}</option>
                    ))}
                  </select>
                  <button onClick={() => removeCourse(course.id)} style={{ ...s.iconBtn, color: '#fa6060' }}>&#10005;</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {config.sections.length === 0 && unassigned.length === 0 && (
        <p style={s.emptyText}>No sections or courses yet. Use the buttons above to get started.</p>
      )}
    </div>
  );
};

// --- Styles ---
const s: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  pageTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  },
  topBarActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
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
    whiteSpace: 'nowrap',
  },
  saveBtn: {
    padding: '8px 18px',
    backgroundColor: '#1a3b2a',
    color: '#4ade80',
    border: '1px solid #166534',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
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
  formBar: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
    padding: '12px 14px',
    backgroundColor: '#17213A',
    border: '1px solid #253655',
    borderRadius: 6,
    flexWrap: 'wrap',
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
  sectionCard: {
    marginBottom: 16,
    padding: '14px 16px',
    backgroundColor: '#0d1a30',
    border: '1px solid #253655',
    borderRadius: 8,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
  },
  sectionActions: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  courseCount: {
    color: '#6B7280',
    fontSize: 12,
    marginRight: 8,
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
  courseCard: {
    marginBottom: 6,
    padding: '10px 12px',
    backgroundColor: '#17213A',
    border: '1px solid #253655',
    borderRadius: 6,
  },
  courseHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: '#9DA7B7',
    cursor: 'pointer',
    fontSize: 14,
    padding: '2px 4px',
    marginTop: 2,
    fontFamily: "'Inter', sans-serif",
  },
  courseTitle: {
    display: 'block',
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  courseDesc: {
    display: 'block',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
    fontFamily: "'Inter', sans-serif",
  },
  courseActions: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    flexShrink: 0,
  },
  editContentBtn: {
    padding: '4px 10px',
    backgroundColor: '#1e3a5f',
    color: '#60a5fa',
    border: '1px solid #2563eb',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
  },
  conceptsArea: {
    marginTop: 10,
    marginLeft: 20,
    borderLeft: '2px solid #253655',
    paddingLeft: 12,
  },
  conceptCard: {
    marginBottom: 8,
    padding: '8px 10px',
    backgroundColor: '#0d1a30',
    border: '1px solid #1e2d4a',
    borderRadius: 4,
  },
  conceptHeader: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  topicRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginBottom: 4,
    paddingLeft: 4,
  },
  implementedLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  topicIdBadge: {
    fontSize: 10,
    color: '#6B7280',
    backgroundColor: '#0d1a30',
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  addBtn: {
    padding: '4px 12px',
    backgroundColor: '#253655',
    color: '#9DA7B7',
    border: '1px solid #353E56',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
    marginTop: 4,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
};

export default ContentManager;
