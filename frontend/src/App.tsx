import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProfileCreation from './components/ProfileCreation';
import Map from './components/Map';
import Profile from './components/Profile'; // Import the Profile component
import './App.css'; // Import the CSS file

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile-creation" element={<ProfileCreation />} />
          <Route path="/map" element={<Map />} />
          <Route path="/profile" element={<Profile />} /> {/* Add Profile route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
