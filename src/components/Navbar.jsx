import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = getCurrentUser();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate(userInfo?.role === 'admin' ? '/admin' : '/student/grade-input')}>
          JUPAS
        </div>
        
        <div className="navbar-right">
          {userInfo?.role === 'student' && (
            <div className="navbar-points">
              权益点数: {userInfo.points}
            </div>
          )}
          
          <div className="navbar-user">
            <button className="navbar-user-btn" onClick={() => setShowMenu(!showMenu)}>
              {userInfo?.username} ▾
            </button>
            
            {showMenu && (
              <div className="navbar-menu">
                {userInfo?.role === 'student' && (
                  <>
                    <div className="navbar-menu-item" onClick={() => { navigate('/student/favorites'); setShowMenu(false); }}>
                      我的收藏
                    </div>
                    <div className="navbar-menu-item" onClick={() => { navigate('/student/settings'); setShowMenu(false); }}>
                      系统设置
                    </div>
                  </>
                )}
                <div className="navbar-menu-item" onClick={handleLogout}>
                  退出登录
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

