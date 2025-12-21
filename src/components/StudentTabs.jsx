import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './StudentTabs.css';

const StudentTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'grade-input', label: '成绩输入', icon: '📝', path: '/student/grade-input' },
    { id: 'favorites', label: '我的收藏', icon: '⭐', path: '/student/favorites' },
    { id: 'settings', label: '系统设置', icon: '⚙️', path: '/student/settings' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="student-tabs">
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${isActive(tab.path) ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentTabs;

