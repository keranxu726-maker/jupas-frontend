import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/api';
import Accounts from './Accounts';
import Rules from './Rules';
import Programs from './Programs';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accounts');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <div className="sidebar-logo">JUPAS</div>
        <div className="sidebar-subtitle">管理后台</div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            账号管理
          </button>
          <button
            className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            计算规则
          </button>
          <button
            className={`nav-item ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            专业数据
          </button>
          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            退出登录
          </button>
        </nav>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'accounts' && <Accounts />}
        {activeTab === 'rules' && <Rules />}
        {activeTab === 'programs' && <Programs />}
      </div>
    </div>
  );
};

export default Dashboard;

