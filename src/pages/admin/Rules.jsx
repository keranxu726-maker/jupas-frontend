import React, { useState } from 'react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './Rules.css';

const Rules = () => {
  const [rules, setRules] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const json = JSON.parse(text);
          const newRule = {
            id: Date.now().toString(),
            name: file.name,
            uploadTime: new Date().toLocaleString(),
            content: json
          };
          setRules([...rules, newRule]);
        } catch (error) {
          alert('JSON文件格式错误');
        }
      }
    };
    input.click();
  };

  const handlePreview = (rule) => {
    setPreviewData(rule);
  };

  const handleDelete = (id) => {
    if (window.confirm('确认删除该规则文件？')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="rules-section">
      <div className="section-header">
        <h2>计算规则管理</h2>
        <Button onClick={handleUpload}>+ 上传规则文件</Button>
      </div>
      
      <div className="rules-grid">
        {rules.length === 0 ? (
          <div className="empty-state">
            <p>暂无规则文件</p>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary)', marginTop: '8px' }}>
              请上传JSON格式的规则文件
            </p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="rule-card">
              <div className="rule-name">{rule.name}</div>
              <div className="rule-time">上传时间：{rule.uploadTime}</div>
              <div className="rule-actions">
                <Button size="small" onClick={() => handlePreview(rule)}>
                  预览
                </Button>
                <Button size="small" type="danger" onClick={() => handleDelete(rule.id)}>
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <Modal
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        title={`规则预览 - ${previewData?.name}`}
        width="700px"
      >
        <pre className="json-preview">
          {JSON.stringify(previewData?.content, null, 2)}
        </pre>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Button onClick={() => setPreviewData(null)}>关闭</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Rules;






