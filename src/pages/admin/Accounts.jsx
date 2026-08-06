import React, { useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import { createAccount, batchImportAccounts, queryUsersByName, cancelUser } from '../../utils/api';
import { ELECTIVE_SUBJECTS } from '../../constants/subjects';
import './Accounts.css';

const Accounts = () => {

  // 搜索和分页状态
  const [searchName, setSearchName] = useState('');
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const pageSize = 10;

  // 新增弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createRole, setCreateRole] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    electiveSubjects: []
  });
  const [excelFile, setExcelFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // 注销确认状态
  const [cancelTarget, setCancelTarget] = useState(null);

  const electiveOptions = ELECTIVE_SUBJECTS.map(s => ({ value: s, label: s }));

  // 加载用户列表
  const loadUsers = async (page = 1, name = searchName) => {
    setLoading(true);
    const result = await queryUsersByName(name, page, pageSize);
    if (result.success) {
      setUserList(result.data);
      setTotalCount(result.totalCount);
      setTotalPage(result.totalPage);
      setCurPage(result.curPage);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurPage(1);
    loadUsers(1, searchName);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // 分页切换
  const goToPage = (page) => {
    if (page < 1 || page > totalPage || page === curPage) return;
    setCurPage(page);
    loadUsers(page, searchName);
  };

  // 注销用户
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const result = await cancelUser(cancelTarget.id);
    if (result.success) {
      alert(result.message || '注销成功');
      setCancelTarget(null);
      loadUsers(curPage, searchName);
    } else {
      alert(result.message || '注销失败');
    }
  };

  const handleAdd = () => {
    setCreateRole('student');
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

    if (createRole === 'student' && formData.electiveSubjects.length === 0) {
      alert('请至少选择1门选修科目');
      return;
    }

    const result = await createAccount({
      username: formData.username,
      password: formData.password,
      role: createRole,
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
      loadUsers(curPage, searchName);
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
        loadUsers(curPage, searchName);
      }
    } else {
      alert(result.message || '批量导入失败');
    }
  };

  // 生成分页按钮
  const renderPagination = () => {
    if (totalPage <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, curPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPage, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return (
      <div className="pagination">
        <span className="pagination-info">共 {totalCount} 条记录，{totalPage} 页</span>
        <button
          className="pagination-btn"
          disabled={curPage <= 1}
          onClick={() => goToPage(curPage - 1)}
        >
          上一页
        </button>
        {pages.map(p => (
          <button
            key={p}
            className={`pagination-btn ${p === curPage ? 'active' : ''}`}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="pagination-btn"
          disabled={curPage >= totalPage}
          onClick={() => goToPage(curPage + 1)}
        >
          下一页
        </button>
      </div>
    );
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

      {/* 搜索栏 */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="输入用户名搜索（支持模糊匹配）"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <Button onClick={handleSearch}>🔍 搜索</Button>
      </div>

      {/* 用户列表表格 */}
      <div className="accounts-table">
        {loading ? (
          <div className="empty-table">加载中...</div>
        ) : userList.length === 0 ? (
          <div className="empty-table">暂无数据，请点击搜索查询或新增账号</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>用户ID</th>
                  <th>用户名</th>
                  <th style={{ width: '100px' }}>用户类型</th>
                  <th>选修科目</th>
                  <th style={{ width: '100px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {userList.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                      <span className={`role-tag ${user.role === 'admin' ? 'role-admin' : 'role-student'}`}>
                        {user.role === 'admin' ? '管理员' : '学生'}
                      </span>
                    </td>
                    <td>
                      {user.electiveSubjectList && user.electiveSubjectList.length > 0
                        ? user.electiveSubjectList.map((s, i) => (
                            <span key={i} className="subject-tag">
                              {s.name || s.alias}
                            </span>
                          ))
                        : <span style={{ color: '#999' }}>—</span>
                      }
                    </td>
                    <td>
                      <button
                        className="btn-cancel"
                        onClick={() => setCancelTarget(user)}
                        title="注销用户"
                      >
                        注销
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
          </>
        )}
      </div>

      {/* 新增账号弹窗 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`新增${createRole === 'student' ? '学生' : '管理员'}账号`}
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            账号类型 *
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              border: `1.5px solid ${createRole === 'student' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: createRole === 'student' ? '#eff6ff' : '#fff'
            }}>
              <input
                type="radio"
                name="role"
                value="student"
                checked={createRole === 'student'}
                onChange={() => setCreateRole('student')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '14px' }}>学生</span>
            </label>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              border: `1.5px solid ${createRole === 'admin' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: createRole === 'admin' ? '#eff6ff' : '#fff'
            }}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={createRole === 'admin'}
                onChange={() => setCreateRole('admin')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '14px' }}>管理员</span>
            </label>
          </div>
        </div>

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

        {createRole === 'student' && (
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
              searchable={true}
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
        )}

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
              请上传包含账号信息的Excel文件
            </p>
            <a
              href={`${import.meta.env.BASE_URL}account_template.xlsx`}
              download="账号导入模板.xlsx"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                background: '#10b981',
                color: 'white',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              下载导入模板
            </a>
          </div>
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
              <li>第4列：选修科目（学生必填，多个用逗号分隔，如：bio,che,phy）</li>
            </ul>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', marginBottom: 0 }}>
              <strong>科目别名参考：</strong><br/>
              bio=生物, che=化学, phy=物理, bafs=商科, eco=经济, geo=地理, hist=历史, ict=信息科技,
              chist=中国历史, clit=中国文学, elit=英国文学, music=音乐, vart=视觉艺术, dat=设计与应用科技,
              ers=伦理与宗教, tour=旅游, hmsc=健康管理, pedu=体育, m1=数学延伸M1, m2=数学延伸M2
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

      {/* 注销确认弹窗 */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="确认注销用户"
      >
        <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          确定要注销以下用户吗？此操作不可撤销。
        </p>
        {cancelTarget && (
          <div style={{
            padding: '16px',
            background: '#fff3e0',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
              <strong>用户ID：</strong>{cancelTarget.id}
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>用户名：</strong>{cancelTarget.username}
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button type="secondary" onClick={() => setCancelTarget(null)}>
            取消
          </Button>
          <Button
            type="primary"
            onClick={handleConfirmCancel}
            style={{ background: '#ef4444', borderColor: '#ef4444' }}
          >
            确认注销
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Accounts;
