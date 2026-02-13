import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentTabs from '../../components/StudentTabs';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { addFavoriteProgram, cancelFavoriteProgram, getFavoritePrograms } from '../../utils/api';
import './Result.css';

// 从 Map<年份, 值> 获取排序后的年份列表
const getSortedYears = (...maps) => {
  const yearSet = new Set();
  maps.forEach(map => {
    if (map && typeof map === 'object') {
      Object.keys(map).forEach(k => yearSet.add(k));
    }
  });
  return Array.from(yearSet).sort((a, b) => Number(a) - Number(b));
};

// 计算匹配度百分比
const calcMatchRate = (totalScore, middleScore, lowScore) => {
  if (!middleScore || !lowScore || typeof middleScore !== 'object') return null;
  const years = Object.keys(middleScore).sort((a, b) => Number(b) - Number(a));
  if (years.length === 0) return null;
  const latestYear = years[0];
  const mid = middleScore[latestYear];
  const low = lowScore?.[latestYear];
  if (mid == null || low == null) return null;

  const range = mid - low;
  if (range <= 0) {
    return totalScore >= mid ? 99 : Math.max(0, Math.round((totalScore / mid) * 50));
  }
  const diff = totalScore - low;
  if (diff < 0) return Math.max(0, Math.round(15 + (diff / low) * 15));
  const ratio = diff / (range * 2);
  return Math.min(99, Math.max(0, Math.round(15 + ratio * 84)));
};

const getMatchColor = (rate) => {
  if (rate >= 85) return '#10B981';
  if (rate >= 60) return '#3B82F6';
  if (rate >= 40) return '#F59E0B';
  if (rate >= 15) return '#F97316';
  return '#EF4444';
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programs = [], grades } = location.state || {};

  const [schoolFilter, setSchoolFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(new Set());
  const [filteredPrograms, setFilteredPrograms] = useState(programs);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const result = await getFavoritePrograms();
    if (result.success) {
      setFavorites(result.data.map(p => p.id));
    }
  };

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

  const handleToggleFavorite = async (majorId) => {
    if (favLoading.has(majorId)) return;
    setFavLoading(prev => new Set(prev).add(majorId));
    const isFav = favorites.includes(majorId);
    const result = isFav
      ? await cancelFavoriteProgram(majorId)
      : await addFavoriteProgram(majorId);
    if (result.success) {
      await loadFavorites();
    } else {
      alert(result.message || '操作失败');
    }
    setFavLoading(prev => {
      const next = new Set(prev);
      next.delete(majorId);
      return next;
    });
  };

  if (!location.state) {
    return null;
  }

  return (
    <div className="result-page">
      <Navbar />
      <StudentTabs />

      <div className="page-content">
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
            <Input placeholder="筛选学校" value={schoolFilter} onChange={setSchoolFilter} />
            <Input placeholder="筛选专业" value={programFilter} onChange={setProgramFilter} />
          </div>

          <div className="result-count">
            共匹配到 <strong>{filteredPrograms.length}</strong> 个专业
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="empty-state">
              <p>暂无符合条件的专业</p>
              <Button onClick={() => navigate('/student/grade-input')}>重新输入成绩</Button>
            </div>
          ) : (
            <div className="programs-list">
              {filteredPrograms.map(program => {
                const matchRate = calcMatchRate(program.totalScore, program.middleScore, program.lowScore);
                const matchColor = matchRate != null ? getMatchColor(matchRate) : '#94a3b8';
                const scoreYears = getSortedYears(program.heightScore, program.middleScore, program.lowScore);
                const admissionYears = getSortedYears(program.admissionCount);
                const allYears = getSortedYears(program.heightScore, program.middleScore, program.lowScore, program.admissionCount);

                return (
                  <div key={program.id} className="rc-card">
                    {/* 顶栏：学校 + 匹配度 + 收藏 */}
                    <div className="rc-top">
                      <div className="rc-school">{program.school}</div>
                      {matchRate != null && (
                        <div className="rc-match">
                          <span className="rc-match-label">专业匹配度</span>
                          <div className="rc-match-bar">
                            <div className="rc-match-fill" style={{ width: `${matchRate}%`, background: matchColor }} />
                          </div>
                          <span className="rc-match-value" style={{ color: matchColor }}>{matchRate}%</span>
                        </div>
                      )}
                      <button
                        className={`favorite-btn ${favorites.includes(program.id) ? 'favorited' : ''}`}
                        disabled={favLoading.has(program.id)}
                        onClick={() => handleToggleFavorite(program.id)}
                        style={favLoading.has(program.id) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {favLoading.has(program.id) ? '...' : favorites.includes(program.id) ? '★' : '☆'}
                      </button>
                    </div>

                    {/* 专业名 + ID */}
                    <div className="rc-title">{program.program}</div>
                    <div className="rc-id">ID: {program.id}</div>

                    {/* 总分 */}
                    {program.totalScore != null && (
                      <div className="rc-total-score">
                        <span className="rc-total-score-label">总分</span>
                        <span className="rc-total-score-value">{program.totalScore.toFixed(1)}</span>
                      </div>
                    )}

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

                    {/* 计算得分（多年度标签） */}
                    <div className="rc-row rc-calc-row">
                      {allYears.length > 0 ? (
                        allYears.map(year => (
                          <div key={year} className="rc-tag rc-tag-score">
                            <span className="rc-tag-label">{year}年计分</span>
                            <span className="rc-tag-value">{program.totalScore != null ? program.totalScore.toFixed(1) : '-'}</span>
                          </div>
                        ))
                      ) : (
                        <div className="rc-tag rc-tag-score">
                          <span className="rc-tag-label">计分</span>
                          <span className="rc-tag-value">{program.totalScore != null ? program.totalScore.toFixed(1) : '-'}</span>
                        </div>
                      )}
                    </div>

                    {/* 计分科目 */}
                    {program.totalSubject && program.totalSubject.length > 0 && (
                      <div className="rc-subjects">
                        <span className="rc-subjects-label">计分科目：</span>
                        <span className="rc-calc-tags">
                          {Array.from(program.totalSubject).map(s => (
                            <span key={s} className="rc-subject-tag">{s}</span>
                          ))}
                        </span>
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

          <div className="result-footer">
            <Button type="secondary" onClick={() => navigate('/student/grade-input')}>重新计算</Button>
            <Button onClick={() => navigate('/student/favorites')}>查看收藏</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

