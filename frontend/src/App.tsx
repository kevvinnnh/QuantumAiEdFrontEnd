// src/App.tsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate
} from 'react-router-dom';
import Login from './components/Login';
import ProfileCreation from './components/ProfileCreation';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Quiz from './components/Quiz';
import AdminDashboard from './components/AdminDashboard';
import { allQuizData } from './components/QuizQuestion';
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
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile-creation" element={<ProfileCreation />} />
          <Route path="/map" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          {/* Use a URL parameter courseId so TS knows we supply it */}
          <Route path="/quiz/:courseId" element={<QuizPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* Redirect any unknown route back to dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
