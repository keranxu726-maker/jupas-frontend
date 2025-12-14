import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './utils/api';
import Login from './pages/Login';
import GradeInput from './pages/student/GradeInput';
import Result from './pages/student/Result';
import Favorites from './pages/student/Favorites';
import Settings from './pages/student/Settings';
import Dashboard from './pages/admin/Dashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const userInfo = getCurrentUser();
  
  if (!userInfo) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRole && userInfo.role !== allowedRole) {
    return <Navigate to={userInfo.role === 'admin' ? '/admin' : '/student/grade-input'} />;
  }
  
  return children;
};

function App() {
  const userInfo = getCurrentUser();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/student/grade-input" element={
          <ProtectedRoute allowedRole="student">
            <GradeInput />
          </ProtectedRoute>
        } />
        <Route path="/student/result" element={
          <ProtectedRoute allowedRole="student">
            <Result />
          </ProtectedRoute>
        } />
        <Route path="/student/favorites" element={
          <ProtectedRoute allowedRole="student">
            <Favorites />
          </ProtectedRoute>
        } />
        <Route path="/student/settings" element={
          <ProtectedRoute allowedRole="student">
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          userInfo ? (
            <Navigate to={userInfo.role === 'admin' ? '/admin' : '/student/grade-input'} />
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

