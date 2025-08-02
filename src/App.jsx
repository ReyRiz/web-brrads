import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import GameRequests from './pages/GameRequests';
import FanArt from './pages/FanArt';
import AdminPanel from './pages/AdminPanel';
import ProfileBRRADS from './pages/ProfileBRRADS';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/games" element={<GameRequests />} />
              <Route path="/fanart" element={<FanArt />} />
              <Route path="/profile" element={<ProfileBRRADS />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireModerator={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
