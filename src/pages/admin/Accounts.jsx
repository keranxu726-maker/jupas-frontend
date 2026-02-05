import React, { useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import { createAccount, batchImportAccounts } from '../../utils/api';
import { ELECTIVE_SUBJECTS } from '../../constants/subjects';
import './Accounts.css';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    electiveSubjects: []
  });
  const [excelFile, setExcelFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const electiveOptions = ELECTIVE_SUBJECTS.map(s => ({ value: s, label: s }));

  const handleAdd = () => {
    setFormData({
      username: '',
      password: '',
      electiveSubjects: []
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.password) {
      alert('请填写完整信息');
      return;
    }

    if (formData.electiveSubjects.length === 0) {
      alert('请至少选择1门选修科目');
      return;
    }

    const result = await createAccount({
      username: formData.username,
      password: formData.password,
      role: activeTab,
      electiveSubjects: formData.electiveSubjects
    });

    if (result.success) {
      alert(result.message || '账号创建成功');
      setModalOpen(false);
      setFormData({
        username: '',
        password: '',
        electiveSubjects: []
      });
    } else {
      alert(result.message || '创建失败');
    }
  };

  const handleExcelUpload = () => {
    setUploadModalOpen(true);
    setExcelFile(null);
    setUploadResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      setUploadResult(null);
    }
  };

  const handleBatchImport = async () => {
    if (!excelFile) {
      alert('请选择Excel文件');
      return;
    }

    const result = await batchImportAccounts(excelFile);

    if (result.success) {
      if (result.hasErrors) {
        setUploadResult({
          success: true,
          hasErrors: true,
          message: result.message,
          errors: result.errors
        });
      } else {
        alert(result.message || '批量导入成功');
        setUploadModalOpen(false);
        setExcelFile(null);
      }
    } else {
      alert(result.message || '批量导入失败');
    }
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

      <div className="info-banner" style={{
        background: '#fff3e0',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#e65100',
        lineHeight: '1.6'
      }}>
        <strong>功能说明：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>✅ 支持新增账号（单个创建）</li>
          <li>✅ 支持Excel批量导入账号</li>
          <li>❌ 后端暂不支持查询、编辑、删除用户功能</li>
        </ul>
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
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          color: '#999'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '12px', color: '#666' }}>账号创建功能</p>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>点击上方"新增账号"按钮创建单个账号</p>
          <p style={{ fontSize: '14px' }}>或使用"Excel批量导入"功能批量创建账号</p>
        </div>
      </div>

      {/* 新增账号弹窗 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`新增${activeTab === 'student' ? '学生' : '管理员'}账号`}
      >
        <Input
          label="账号名称 *"
          value={formData.username}
          onChange={(v) => setFormData({ ...formData, username: v })}
          placeholder="请输入账号名称"
        />

        <Input
          type="password"
          label="登录密码 *"
          value={formData.password}
          onChange={(v) => setFormData({ ...formData, password: v })}
          placeholder="请输入登录密码"
        />

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            选修科目 *（至少选择1门）
          </label>
          <Select
            value=""
            onChange={(subject) => {
              if (subject && !formData.electiveSubjects.includes(subject)) {
                setFormData({ ...formData, electiveSubjects: [...formData.electiveSubjects, subject] });
              }
            }}
            options={electiveOptions.filter(s => !formData.electiveSubjects.includes(s.value))}
            placeholder="+ 添加选修科目"
          />
          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {formData.electiveSubjects.length === 0 ? (
              <span style={{ fontSize: '13px', color: '#999' }}>暂未选择任何科目</span>
            ) : (
              formData.electiveSubjects.map((subject, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    background: '#e3f2fd',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: '#1565c0'
                  }}
                >
                  {subject}
                  <button
                    onClick={() => {
                      const newSubjects = formData.electiveSubjects.filter((_, i) => i !== index);
                      setFormData({ ...formData, electiveSubjects: newSubjects });
                    }}
                    style={{
                      marginLeft: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#1565c0',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button type="secondary" onClick={() => setModalOpen(false)}>
            取消
          </Button>
          <Button type="primary" onClick={handleSave}>
            创建账号
          </Button>
        </div>
      </Modal>

      {/* Excel批量导入弹窗 */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setExcelFile(null);
          setUploadResult(null);
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
              <li>第1列：账号名称（必填）</li>
              <li>第2列：登录密码（必填）</li>
              <li>第3列：用户类型（必填，填 "student" 或 "admin"）</li>
              <li>第4列：选修科目（必填，多个用逗号分隔，如：bio,che,phy）</li>
            </ul>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', marginBottom: 0 }}>
              <strong>科目别名参考：</strong><br/>
              bio=生物, che=化学, phy=物理, bafs=商科, eco=经济, geo=地理, hist=历史, ict=信息科技
            </p>
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

          {uploadResult && uploadResult.hasErrors && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffc107'
            }}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#856404' }}>
                ⚠️ 部分数据导入失败
              </p>
              <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                {uploadResult.errors.map((err, index) => (
                  <p key={index} style={{ fontSize: '12px', color: '#856404', margin: '4px 0' }}>
                    {err}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button type="secondary" onClick={() => {
            setUploadModalOpen(false);
            setExcelFile(null);
            setUploadResult(null);
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
