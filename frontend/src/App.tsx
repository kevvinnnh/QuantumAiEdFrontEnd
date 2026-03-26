// src/App.tsx

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/sarabun/400.css';
import '@fontsource/sarabun/500.css';
import '@fontsource/sarabun/600.css';
import React from 'react';
import {
  useParams,
  useNavigate,
  Navigate,
  HashRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Login from './components/Login';
import ProfileCreation from './components/ProfileCreation';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import AdminDashboard from './components/AdminDashboard';
import ResetPassword from './components/ResetPassword';
import { allQuizData } from './components/QuizQuestion';
import { AuthProvider, ProtectedRoute, AdminRoute, AdminToggle } from './AuthContext';
import './App.css';

/**
 * QuizPage acts as a thin wrapper around the Quiz component,
 * pulling courseId from the URL and looking up the appropriate questions.
 */
const QuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const id = Number(courseId);
  const questions = allQuizData[id] || [];

  // If no such course, redirect back to Dashboard
  if (isNaN(id) || !allQuizData.hasOwnProperty(id)) {
    return <Navigate to="/map" replace />;
  }

  return (
    <Quiz
      courseId={id}
      questions={questions}
      onComplete={() => {
        navigate('/map');
      }}
      onExit={() => {
        navigate('/map');
      }}
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
