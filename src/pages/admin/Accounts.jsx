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
  const [excelFile, setExcelFile] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

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

  const handleExcelUpload = () => {
    setUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
    }
  };

  const handleBatchImport = async () => {
    if (!excelFile) {
      alert('请选择Excel文件');
      return;
    }

    // 模拟处理Excel文件
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // 这里应该解析Excel，暂时模拟批量添加
        alert('Excel批量导入功能需要后端支持。\n\n格式要求：\n列1: 账号名称\n列2: 登录密码\n列3: 权益点数（仅学生账号）');
        
        setUploadModalOpen(false);
        setExcelFile(null);
      } catch (error) {
        alert('文件解析失败，请检查文件格式');
      }
    };
    reader.readAsArrayBuffer(excelFile);
  };

  return (
    <div className="accounts-section">
      <div className="section-header">
        <h2>账号管理</h2>
        <div className="header-actions">
          <Button type="secondary" onClick={handleExcelUpload}>📊 Excel批量导入</Button>
          <Button onClick={handleAdd}>+ 新增账号</Button>
        </div>
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
      
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setExcelFile(null);
        }}
        title="Excel批量导入账号"
      >
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            请上传包含账号信息的Excel文件
          </p>
          <div style={{ 
            padding: '16px', 
            background: 'var(--color-bg-light)', 
            borderRadius: 'var(--border-radius)',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '13px', marginBottom: '8px', fontWeight: '600' }}>文件格式要求：</p>
            <ul style={{ fontSize: '13px', color: 'var(--color-text-secondary)', paddingLeft: '20px', margin: 0 }}>
              <li>第1列：账号名称</li>
              <li>第2列：登录密码</li>
              {activeTab === 'student' && <li>第3列：权益点数（数字）</li>}
            </ul>
          </div>
          
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1.5px dashed var(--color-border)',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer'
            }}
          />
          
          {excelFile && (
            <p style={{ 
              marginTop: '12px', 
              fontSize: '13px', 
              color: 'var(--color-success)' 
            }}>
              ✓ 已选择文件：{excelFile.name}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button type="secondary" onClick={() => {
            setUploadModalOpen(false);
            setExcelFile(null);
          }}>
            取消
          </Button>
          <Button type="primary" onClick={handleBatchImport}>
            开始导入
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Accounts;






