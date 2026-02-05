import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = getCurrentUser();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef(null);

  const handleLogout = async () => {
    await logout();
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

  const handleMenuClick = (action) => {
    action();
    setShowMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate(userInfo?.role === 'admin' ? '/admin' : '/student/grade-input')}>
          JUPAS
        </div>

        <div className="navbar-right">
          <div className="navbar-user" ref={menuRef}>
            <button className="navbar-user-btn" onClick={() => setShowMenu(!showMenu)}>
              {userInfo?.username || userInfo?.userName} ▾
            </button>

            {showMenu && (
              <div className="navbar-menu">
                <div className="navbar-menu-item" onClick={() => handleMenuClick(handleLogout)}>
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






