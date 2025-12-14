import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { resetPassword } from '../../utils/api';
import './Settings.css';

const Settings = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!oldPassword) {
      newErrors.oldPassword = '请输入原密码';
    }
    
    if (!newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = '密码长度至少6位';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const result = await resetPassword(oldPassword, newPassword);
    
    if (result.success) {
      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } else {
      setErrors({ oldPassword: result.message });
    }
  };

  return (
    <div className="settings-page">
      <Navbar />
      
      <div className="page-container">
        <h2 className="page-title">系统设置</h2>
        
        <div className="settings-card">
          <div className="card-header">
            <h3>重置密码</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <Input
                type="password"
                label="原密码"
                value={oldPassword}
                onChange={setOldPassword}
                placeholder="请输入原密码"
                error={errors.oldPassword}
              />
              
              <Input
                type="password"
                label="新密码"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="请输入新密码（至少6位）"
                error={errors.newPassword}
              />
              
              <Input
                type="password"
                label="确认新密码"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="请再次输入新密码"
                error={errors.confirmPassword}
              />
              
              <div style={{ marginTop: '24px' }}>
                <Button type="primary" fullWidth>
                  确认修改
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Modal isOpen={success} onClose={() => setSuccess(false)} title="修改成功">
        <p>密码已成功修改，请妥善保管。</p>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Button onClick={() => setSuccess(false)}>确定</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

