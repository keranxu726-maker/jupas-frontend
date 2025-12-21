import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = getCurrentUser();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 点击外部关闭菜单
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // 鼠标离开时关闭菜单
  const handleMouseLeave = () => {
    setShowMenu(false);
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
          
          <div className="navbar-user" ref={menuRef} onMouseLeave={handleMouseLeave}>
            <button className="navbar-user-btn" onClick={() => setShowMenu(!showMenu)}>
              {userInfo?.username} ▾
            </button>
            
            {showMenu && (
              <div className="navbar-menu">
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






