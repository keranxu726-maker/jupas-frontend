import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../utils/api';
import './Accounts.css';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [accounts, setAccounts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student',
    points: 10
  });

  useEffect(() => {
    loadAccounts();
  }, [activeTab]);

  const loadAccounts = async () => {
    const result = await getAccounts(activeTab);
    if (result.success) {
      setAccounts(result.data);
    }
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setFormData({
      username: '',
      password: '',
      role: activeTab,
      points: 10
    });
    setModalOpen(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      username: account.username,
      password: account.password,
      role: account.role,
      points: account.points || 10
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.password) {
      alert('请填写完整信息');
      return;
    }

    let result;
    if (editingAccount) {
      result = await updateAccount(editingAccount.id, formData);
    } else {
      result = await createAccount(formData);
    }

    if (result.success) {
      setModalOpen(false);
      loadAccounts();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确认删除该账号？')) {
      const result = await deleteAccount(id);
      if (result.success) {
        loadAccounts();
      }
    }
  };

  return (
    <div className="accounts-section">
      <div className="section-header">
        <h2>账号管理</h2>
        <Button onClick={handleAdd}>+ 新增账号</Button>
      </div>
      
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          学生账号
        </button>
        <button
          className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          管理员账号
        </button>
      </div>
      
      <div className="accounts-table">
        <table>
          <thead>
            <tr>
              <th>账号名称</th>
              <th>登录密码</th>
              {activeTab === 'student' && <th>权益点数</th>}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td>{account.username}</td>
                <td>{'*'.repeat(account.password.length)}</td>
                {activeTab === 'student' && <td>{account.points}</td>}
                <td>
                  <div className="table-actions">
                    <Button size="small" onClick={() => handleEdit(account)}>
                      编辑
                    </Button>
                    <Button size="small" type="danger" onClick={() => handleDelete(account.id)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {accounts.length === 0 && (
          <div className="empty-table">暂无数据</div>
        )}
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAccount ? '编辑账号' : '新增账号'}
      >
        <Input
          label="账号名称"
          value={formData.username}
          onChange={(v) => setFormData({ ...formData, username: v })}
          placeholder="请输入账号名称"
        />
        
        <Input
          type="password"
          label="登录密码"
          value={formData.password}
          onChange={(v) => setFormData({ ...formData, password: v })}
          placeholder="请输入登录密码"
        />
        
        {activeTab === 'student' && (
          <Input
            type="number"
            label="权益点数"
            value={formData.points}
            onChange={(v) => setFormData({ ...formData, points: parseInt(v) || 0 })}
            placeholder="请输入权益点数"
          />
        )}
        
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button type="secondary" onClick={() => setModalOpen(false)}>
            取消
          </Button>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Accounts;

