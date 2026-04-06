// src/App.tsx

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/sarabun/400.css';
import '@fontsource/sarabun/500.css';
import '@fontsource/sarabun/600.css';
import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  Navigate,
  HashRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Login from './components/auth/Login';
import ProfileCreation from './components/profile/ProfileCreation';
import Dashboard from './components/dashboard/Dashboard';
import Quiz from './components/quiz/Quiz';
import AdminDashboard from './components/admin/AdminDashboard';
import ResetPassword from './components/auth/ResetPassword';
import api from './api';
import type { Question } from './types/quiz';
import { AuthProvider, ProtectedRoute, AdminRoute, AdminToggle } from './AuthContext';
import './App.css';

/**
 * QuizPage fetches quiz questions from the API by courseId and renders the Quiz component.
 */
const QuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const id = Number(courseId);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (isNaN(id)) return;
    api.get(`/api/lessons/${id}`)
      .then(res => { setQuestions(res.data.quiz || []); })
      .catch(() => { setLoadError(true); });
  }, [id]);

  if (isNaN(id) || loadError) return <Navigate to="/map" replace />;
  if (questions === null) return null;

  return (
    <Quiz
      courseId={id}
      questions={questions}
      onComplete={() => { navigate('/map'); }}
      onExit={() => { navigate('/map'); }}
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile-creation" element={<ProtectedRoute><ProfileCreation /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/quiz/:courseId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
          <AdminToggle />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
