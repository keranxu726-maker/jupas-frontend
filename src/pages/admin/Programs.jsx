import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { getAllPrograms } from '../../utils/api';
import './Programs.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = programs.filter(p =>
        p.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(programs);
    }
  }, [searchTerm, programs]);

  const loadPrograms = async () => {
    const result = await getAllPrograms();
    if (result.success) {
      setPrograms(result.data);
      setFilteredPrograms(result.data);
    }
  };

  const handleImport = () => {
    alert('导入功能：请选择Excel/CSV文件上传');
  };

  return (
    <div className="programs-section">
      <div className="section-header">
        <h2>专业数据管理</h2>
        <Button onClick={handleImport}>导入数据</Button>
      </div>
      
      <div className="search-bar">
        <Input
          placeholder="搜索学校、专业或ID"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
      
      <div className="programs-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>学校</th>
              <th>专业</th>
              <th>总分</th>
              <th>最高分</th>
              <th>最低分</th>
              <th>中位数</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map(program => (
              <tr key={program.id}>
                <td>{program.id}</td>
                <td>{program.school}</td>
                <td>{program.program}</td>
                <td>{program.totalScore}</td>
                <td>{program.historyScore.max}</td>
                <td>{program.historyScore.min}</td>
                <td>{program.historyScore.median}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPrograms.length === 0 && (
          <div className="empty-table">
            {searchTerm ? '未找到匹配的专业' : '暂无数据'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;






