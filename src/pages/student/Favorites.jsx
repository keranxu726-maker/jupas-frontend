import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentTabs from '../../components/StudentTabs';
import Button from '../../components/Button';
import { getFavoritePrograms, cancelFavoriteProgram } from '../../utils/api';
import './Favorites.css';
import './Result.css';

// 从多个 Map 中提取并排序所有年份
const getSortedYears = (...maps) => {
  const yearSet = new Set();
  maps.forEach(map => {
    if (map && typeof map === 'object') {
      Object.keys(map).forEach(k => yearSet.add(k));
    }
  });
  return Array.from(yearSet).sort((a, b) => Number(a) - Number(b));
};

const Favorites = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(new Set());

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

  const handleRemoveFavorite = async (majorId) => {
    if (removing.has(majorId)) return;
    setRemoving(prev => new Set(prev).add(majorId));
    const result = await cancelFavoriteProgram(majorId);
    if (result.success) {
      await loadFavorites();
    } else {
      alert(result.message || '取消收藏失败');
    }
    setRemoving(prev => { const n = new Set(prev); n.delete(majorId); return n; });
  };

  const handleExport = () => {
    if (programs.length === 0) return;

    let content = '我的收藏专业列表\n';
    content += '==========================================\n\n';

    programs.forEach((program, index) => {
      content += `${index + 1}. ${program.school} - ${program.program}\n`;
      content += `   专业代码: ${program.id}\n`;
      const scoreYears = getSortedYears(program.heightScore, program.middleScore, program.lowScore);
      scoreYears.forEach(year => {
        content += `   ${year}年 上四分位: ${program.heightScore?.[year] ?? '-'} / 中位数: ${program.middleScore?.[year] ?? '-'} / 下四分位: ${program.lowScore?.[year] ?? '-'}\n`;
      });
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
              <Button onClick={handleExport}>导出收藏</Button>
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
            <div className="programs-list">
              {programs.map(program => {
                const scoreYears = getSortedYears(program.heightScore, program.middleScore, program.lowScore);
                const admissionYears = getSortedYears(program.admissionCount);

                return (
                  <div key={program.id} className="rc-card">
                    {/* 顶栏：学校 + 取消收藏 */}
                    <div className="rc-top">
                      <div className="rc-school">{program.school}</div>
                      <button
                        className="remove-favorite-btn"
                        disabled={removing.has(program.id)}
                        onClick={() => handleRemoveFavorite(program.id)}
                        style={removing.has(program.id) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {removing.has(program.id) ? '取消中...' : '取消收藏'}
                      </button>
                    </div>

                    {/* 专业名 + ID */}
                    <div className="rc-title">{program.program}</div>
                    <div className="rc-id">ID: {program.id}</div>

                    {/* 招生人数（多年度标签） */}
                    {admissionYears.length > 0 && (
                      <div className="rc-row rc-admission">
                        {admissionYears.map(year => (
                          <div key={year} className="rc-tag rc-tag-admission">
                            <span className="rc-tag-label">{year}年招生人数</span>
                            <span className="rc-tag-value">{program.admissionCount[year]}人</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 各年录取分数线 - 横向卡片 */}
                    {scoreYears.length > 0 && (
                      <div className="rc-score-cards">
                        {scoreYears.map(year => (
                          <div key={year} className="rc-score-card">
                            <div className="rc-score-card-title">{year}年录取分数线</div>
                            <div className="rc-score-card-body">
                              <div className="rc-score-item">
                                <span className="rc-score-item-label">上四分位</span>
                                <span className="rc-score-item-value">{program.heightScore?.[year] ?? '-'}</span>
                              </div>
                              <div className="rc-score-item">
                                <span className="rc-score-item-label">中位数</span>
                                <span className="rc-score-item-value rc-score-mid">{program.middleScore?.[year] ?? '-'}</span>
                              </div>
                              <div className="rc-score-item">
                                <span className="rc-score-item-label">下四分位</span>
                                <span className="rc-score-item-value">{program.lowScore?.[year] ?? '-'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 详情链接 */}
                    {program.majorDetailLink && (
                      <div className="rc-link">
                        <a href={program.majorDetailLink} target="_blank" rel="noopener noreferrer">
                          查看专业详情 →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;






