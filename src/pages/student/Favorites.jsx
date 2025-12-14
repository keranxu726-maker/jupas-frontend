import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
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

  return (
    <div className="favorites-page">
      <Navbar />
      
      <div className="page-container">
        <h2 className="page-title">我的收藏</h2>
        
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
  );
};

export default Favorites;

