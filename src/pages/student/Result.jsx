import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { toggleFavoriteProgram } from '../../utils/api';
import { getFavorites } from '../../utils/mockData';
import './Result.css';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalScore, programs = [], grades } = location.state || {};
  
  const [schoolFilter, setSchoolFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState(programs);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    if (!location.state) {
      navigate('/student/grade-input');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let filtered = programs;
    
    if (schoolFilter) {
      filtered = filtered.filter(p => 
        p.school.toLowerCase().includes(schoolFilter.toLowerCase())
      );
    }
    
    if (programFilter) {
      filtered = filtered.filter(p => 
        p.program.toLowerCase().includes(programFilter.toLowerCase())
      );
    }
    
    setFilteredPrograms(filtered);
  }, [schoolFilter, programFilter, programs]);

  const handleToggleFavorite = async (programId) => {
    await toggleFavoriteProgram(programId);
    setFavorites(getFavorites());
  };

  const getSuccessRateColor = (rate) => {
    switch (rate) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getSuccessRateText = (rate) => {
    switch (rate) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '-';
    }
  };

  if (!location.state) {
    return null;
  }

  return (
    <div className="result-page">
      <Navbar />
      
      <div className="page-container">
        <h2 className="page-title">计算结果</h2>
        
        {grades && (
          <div className="grades-summary">
            <div className="grades-section">
              <h4>必选科目</h4>
              <div className="grades-list">
                {grades.required && Object.entries(grades.required).map(([subject, grade]) => (
                  <div key={subject} className="grade-item">
                    <span className="grade-subject">{subject}</span>
                    <span className="grade-value">{grade}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {grades.elective && grades.elective.length > 0 && (
              <div className="grades-section">
                <h4>选修科目</h4>
                <div className="grades-list">
                  {grades.elective.map((item, index) => (
                    <div key={index} className="grade-item">
                      <span className="grade-subject">{item.subject}</span>
                      <span className="grade-value">{item.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="filter-section">
          <Input
            placeholder="筛选学校"
            value={schoolFilter}
            onChange={setSchoolFilter}
          />
          <Input
            placeholder="筛选专业"
            value={programFilter}
            onChange={setProgramFilter}
          />
        </div>
        
        {filteredPrograms.length === 0 ? (
          <div className="empty-state">
            <p>暂无符合条件的专业</p>
            <Button onClick={() => navigate('/student/grade-input')}>
              重新输入成绩
            </Button>
          </div>
        ) : (
          <div className="programs-grid">
            {filteredPrograms.map(program => (
              <div key={program.id} className="program-card">
                <div className="program-header">
                  <div className="program-school">{program.school}</div>
                  <button
                    className={`favorite-btn ${favorites.includes(program.id) ? 'favorited' : ''}`}
                    onClick={() => handleToggleFavorite(program.id)}
                  >
                    {favorites.includes(program.id) ? '★' : '☆'}
                  </button>
                </div>
                
                <div className="program-name">{program.program}</div>
                <div className="program-id">ID: {program.id}</div>
                
                <div className="program-scores">
                  <div className="score-item">
                    <div className="score-label">总分</div>
                    <div className="score-value">{program.totalScore}</div>
                  </div>
                  
                  <div 
                    className="success-rate"
                    style={{ color: getSuccessRateColor(program.successRate) }}
                  >
                    成功率: {getSuccessRateText(program.successRate)}
                  </div>
                </div>
                
                <div className="history-scores">
                  <div className="history-title">往年录取分</div>
                  <div className="history-values">
                    <span>最高: {program.historyScore.max}</span>
                    <span>最低: {program.historyScore.min}</span>
                    <span>中位: {program.historyScore.median}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="result-footer">
          <Button type="secondary" onClick={() => navigate('/student/grade-input')}>
            重新计算
          </Button>
          <Button onClick={() => navigate('/student/favorites')}>
            查看收藏
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Result;

