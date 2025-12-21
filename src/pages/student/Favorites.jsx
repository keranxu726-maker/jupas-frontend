import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentTabs from '../../components/StudentTabs';
import Button from '../../components/Button';
import { getFavoritePrograms, toggleFavoriteProgram } from '../../utils/api';
import './Favorites.css';

const Favorites = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    const result = await getFavoritePrograms();
    if (result.success) {
      setPrograms(result.data);
    }
    setLoading(false);
  };

  const handleRemoveFavorite = async (programId) => {
    await toggleFavoriteProgram(programId);
    loadFavorites();
  };

  const handleExport = () => {
    if (programs.length === 0) return;
    
    let content = '我的收藏专业列表\n';
    content += '==========================================\n\n';
    
    programs.forEach((program, index) => {
      content += `${index + 1}. ${program.school} - ${program.program}\n`;
      content += `   专业代码: ${program.id}\n`;
      content += `   往年录取分:\n`;
      content += `     最高分: ${program.historyScore.max}\n`;
      content += `     最低分: ${program.historyScore.min}\n`;
      content += `     中位数: ${program.historyScore.median}\n`;
      content += `   总分要求: ${program.totalScore}\n`;
      content += '\n';
    });
    
    content += '==========================================\n';
    content += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
    content += `总计: ${programs.length} 个专业\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `我的收藏专业_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="favorites-page">
      <Navbar />
      <StudentTabs />
      
      <div className="page-content">
        <div className="page-container">
        <div className="favorites-header">
          <h2 className="page-title">我的收藏</h2>
          {programs.length > 0 && (
            <Button onClick={handleExport}>
              📥 导出收藏
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : programs.length === 0 ? (
          <div className="empty-state">
            <p>您还没有收藏任何专业</p>
            <Button onClick={() => navigate('/student/grade-input')}>
              去输入成绩
            </Button>
          </div>
        ) : (
          <div className="favorites-list">
            {programs.map(program => (
              <div key={program.id} className="favorite-card">
                <div className="favorite-header">
                  <div>
                    <div className="favorite-school">{program.school}</div>
                    <div className="favorite-program">{program.program}</div>
                    <div className="favorite-id">ID: {program.id}</div>
                  </div>
                  <button
                    className="remove-favorite-btn"
                    onClick={() => handleRemoveFavorite(program.id)}
                  >
                    取消收藏
                  </button>
                </div>
                
                <div className="favorite-scores">
                  <div className="score-group">
                    <span className="score-label">往年最高分:</span>
                    <span className="score-value">{program.historyScore.max}</span>
                  </div>
                  <div className="score-group">
                    <span className="score-label">往年最低分:</span>
                    <span className="score-value">{program.historyScore.min}</span>
                  </div>
                  <div className="score-group">
                    <span className="score-label">往年中位数:</span>
                    <span className="score-value">{program.historyScore.median}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;






