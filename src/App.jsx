import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import OCRResultsPage from './pages/OCRResultsPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <OCRResultsPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;