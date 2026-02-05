import React from 'react';
import './Rules.css';

const Rules = () => {
  return (
    <div className="rules-section">
      <div className="section-header">
        <h2>计算规则管理</h2>
      </div>

      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: '#666'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '16px', color: '#333' }}>计算规则功能</p>
        <p style={{ fontSize: '14px', marginBottom: '8px', color: '#999' }}>
          后端暂未提供计算规则管理接口
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          计算规则目前由后端固定配置，前端无法修改
        </p>
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'left',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            当前计算方式：
          </p>
          <ul style={{ fontSize: '13px', color: '#666', paddingLeft: '20px', margin: 0 }}>
            <li>必选科目成绩转换：U=0, 1=1, 2=2, ..., 5**=7</li>
            <li>选修科目成绩转换：同上</li>
            <li>总分 = 所有科目成绩转换后相加</li>
            <li>专业匹配：根据总分与专业往年录取分对比</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Rules;
