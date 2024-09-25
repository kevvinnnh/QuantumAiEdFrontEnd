// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProfileCreation from './components/ProfileCreation';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile-creation" element={<ProfileCreation />} />
      </Routes>
    </Router>
  );
};

export default App;
