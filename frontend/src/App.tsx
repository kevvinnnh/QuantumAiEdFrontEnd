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
  useNavigate
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
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

/**
 * QuizPage acts as a thin wrapper around the Quiz component,
 * pulling courseId from the URL and looking up the appropriate questions.
 */
const QuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const id = Number(courseId);
  const questions = allQuizData[id] || [];

  // If no such course or no questions, redirect back to Dashboard
  React.useEffect(() => {
    if (isNaN(id) || !allQuizData.hasOwnProperty(id)) {
      navigate('/map', { replace: true });
    }
  }, [id, navigate]);

  return (
    <Quiz
      courseId={id}
      questions={questions}
      onComplete={() => {
        // After finishing the quiz, go back to the map/dashboard
        navigate('/map');
      }}
      onExit={() => {
        // If user clicks “Back to Courses”
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
