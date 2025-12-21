import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      if (result.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student/grade-input');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      {/* 装饰元素 */}
      <div className="decoration-circle decoration-circle-1"></div>
      <div className="decoration-circle decoration-circle-2"></div>
      <div className="decoration-circle decoration-circle-3"></div>
      
      <div className="login-container">
        <div className="login-header">
          <h1>JUPAS</h1>
          <p>成绩计算与专业推荐系统</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <Input
            label="用户名"
            value={username}
            onChange={setUsername}
            placeholder="请输入用户名"
          />
          
          <Input
            type="password"
            label="密码"
            value={password}
            onChange={setPassword}
            placeholder="请输入密码"
          />
          
          <Button type="primary" fullWidth disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
        
        <div className="login-tips">
          <div className="login-tip-title">测试账号：</div>
          <div className="login-tip-item">管理员：admin / admin123</div>
          <div className="login-tip-item">学生：student1 / 123456</div>
        </div>
      </div>
      
      <Modal isOpen={!!error} onClose={() => setError('')} title="登录失败">
        <p>{error}</p>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Button onClick={() => setError('')}>确定</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;






