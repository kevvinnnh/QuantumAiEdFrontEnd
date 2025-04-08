// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProfileCreation from './components/ProfileCreation';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Quiz from './components/Quiz';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile-creation" element={<ProfileCreation />} />
          <Route path="/map" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz" element={<Quiz onComplete={() => {}} onExit={() => {}} />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
