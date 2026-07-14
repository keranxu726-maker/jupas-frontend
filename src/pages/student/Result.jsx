import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentTabs from '../../components/StudentTabs';
import Input from '../../components/Input';
import Button from '../../components/Button';
import {
  addFavoriteProgram,
  cancelFavoriteProgram,
  getFavoritePrograms,
  queryMajorDetailByMajorId
} from '../../utils/api';
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

// 计算专业匹配度
const getMatchLevel = (totalScore, middleScore, lowScore, heightScore) => {
  if (!middleScore && !lowScore && !heightScore) return null;
  
  const allScores = [middleScore, lowScore, heightScore].filter(s => s && typeof s === 'object');
  if (allScores.length === 0) return null;
  
  // 获取所有年份并排序（从新到旧）
  const years = new Set();
  allScores.forEach(score => {
    Object.keys(score).forEach(k => years.add(k));
  });
  
  const sortedYears = Array.from(years).sort((a, b) => Number(b) - Number(a));
  if (sortedYears.length === 0) return null;

  // 从最新年份开始查找第一个有数据的年份
  let latestValidYear = null;
  for (const year of sortedYears) {
    const high = heightScore?.[year];
    const mid = middleScore?.[year];
    const low = lowScore?.[year];
    
    if (high != null || mid != null || low != null) {
      latestValidYear = year;
      break;
    }
  }

  if (!latestValidYear) return null;

  const high = heightScore?.[latestValidYear];
  const mid = middleScore?.[latestValidYear];
  const low = lowScore?.[latestValidYear];

  if (totalScore == null) return null;

  // 根据可用的数据进行判断
  if (high != null && totalScore > high) {
    return { level: 'excellent', color: '#10B981', label: '优秀' };
  }

  // 三个分位数都存在时，依次按上四分位、中位数、下四分位判断
  if (high != null && mid != null && low != null) {
    if (totalScore > mid) {
      return { level: 'good', color: '#3B82F6', label: '良好' };
    } else if (totalScore > low) {
      return { level: 'medium', color: '#F59E0B', label: '中等' };
    } else {
      return { level: 'low', color: '#EF4444', label: '较低' };
    }
  }
  
  // 当上四分位缺失时，只看中位数和下四分位
  if (high == null && mid != null && low != null) {
    if (totalScore > mid) {
      return { level: 'good', color: '#3B82F6', label: '良好' };
    } else if (totalScore > low) {
      return { level: 'medium', color: '#F59E0B', label: '中等' };
    } else {
      return { level: 'low', color: '#EF4444', label: '较低' };
    }
  }
  
  // 当中位数缺失时，只看上四分位和下四分位
  if (mid == null && high != null && low != null) {
    if (totalScore > high) {
      return { level: 'excellent', color: '#10B981', label: '优秀' };
    } else if (totalScore > low) {
      return { level: 'good', color: '#3B82F6', label: '良好' };
    } else {
      return { level: 'low', color: '#EF4444', label: '较低' };
    }
  }
  
  // 当下四分位缺失时，只看上四分位和中位数
  if (low == null && high != null && mid != null) {
    if (totalScore > high) {
      return { level: 'excellent', color: '#10B981', label: '优秀' };
    } else if (totalScore > mid) {
      return { level: 'good', color: '#3B82F6', label: '良好' };
    } else {
      return { level: 'low', color: '#EF4444', label: '较低' };
    }
  }
  
  // 当只有中位数存在时
  if (high == null && mid != null && low == null) {
    if (totalScore > mid) {
      return { level: 'good', color: '#3B82F6', label: '良好' };
    } else {
      return { level: 'low', color: '#EF4444', label: '较低' };
    }
  }
  
  // 当只有下四分位存在时
  if (high == null && mid == null && low != null) {
    if (totalScore > low) {
      return { level: 'medium', color: '#F59E0B', label: '中等' };
    } else {
      return { level: 'low', color: '#EF4444', label: '较低' };
    }
  }
  
  // 当只有上四分位存在时
  if (high != null && mid == null && low == null) {
    if (totalScore > high) {
      return { level: 'excellent', color: '#10B981', label: '优秀' };
    } else {
      return { level: 'low', color: '#EF4444', label: '较低' };
    }
  }

  // 默认情况：三个都为空
  return { level: 'unknown', color: '#94a3b8', label: '未知' };
};


const SCHOOL_ORDER = [
  '香港大学',
  '香港中文大学',
  '香港科技大学',
  '香港城市大学',
  '香港理工大学',
  '香港浸会大学',
  '香港教育大学',
  '岭南大学',
  '香港都会大学',
  'SSSDP',
];

const SCHOOL_KEYWORDS = [
  { key: '香港大学', aliases: ['香港大学', 'HKU'] },
  { key: '香港中文大学', aliases: ['香港中文大学', 'CUHK'] },
  { key: '香港科技大学', aliases: ['香港科技大学', 'HKUST'] },
  { key: '香港城市大学', aliases: ['香港城市大学', 'CityU'] },
  { key: '香港理工大学', aliases: ['香港理工大学', 'PolyU'] },
  { key: '香港浸会大学', aliases: ['香港浸会大学', 'HKBU'] },
  { key: '香港教育大学', aliases: ['香港教育大学', 'EdUHK'] },
  { key: '岭南大学', aliases: ['岭南大学', 'LingnanU'] },
  { key: '香港都会大学', aliases: ['香港都会大学', 'HKMU'] },
  { key: 'SSSDP', aliases: ['SSSDP'] },
];

const getSchoolKey = (school) => {
  const schoolText = school || '';
  const matched = SCHOOL_KEYWORDS.find(item =>
    item.aliases.some(alias => schoolText.includes(alias))
  );
  return matched?.key || school;
};

const getMatchRank = (program) => {
  const matchInfo = getMatchLevel(
    program.totalScore,
    program.middleScore,
    program.lowScore,
    program.heightScore
  );
  const rankMap = {
    excellent: 4,
    good: 3,
    medium: 2,
    low: 1,
    unknown: 0,
  };
  return rankMap[matchInfo?.level] ?? -1;
};

const sortByAdmissionChance = (a, b) => {
  const rankDiff = getMatchRank(b) - getMatchRank(a);
  if (rankDiff !== 0) return rankDiff;
  return (b.totalScore ?? 0) - (a.totalScore ?? 0);
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programs = [], grades } = location.state || {};

  const [schoolFilter, setSchoolFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(new Set());
  const [expandedProgramIds, setExpandedProgramIds] = useState(new Set());
  const [wayToCalByMajor, setWayToCalByMajor] = useState({});
  const [wayToCalLoading, setWayToCalLoading] = useState(new Set());
  const [wayToCalFailed, setWayToCalFailed] = useState(new Set());
  const keywordFilteredPrograms = useMemo(() => {
    if (!programFilter) return programs;

    const filterLower = programFilter.toLowerCase();
    return programs.filter(p =>
      (p.program || '').toLowerCase().includes(filterLower) ||
      (p.id || '').toLowerCase().includes(filterLower)
    );
  }, [programFilter, programs]);

  const schoolFilters = useMemo(() => {
    const counts = keywordFilteredPrograms.reduce((acc, program) => {
      const school = program.school || '未知学校';
      acc.set(school, (acc.get(school) || 0) + 1);
      return acc;
    }, new Map());

    return Array.from(counts.entries())
      .map(([school, count]) => ({
        value: school,
        label: school,
        count,
      }))
      .sort((a, b) => {
        const aIndex = SCHOOL_ORDER.indexOf(getSchoolKey(a.value));
        const bIndex = SCHOOL_ORDER.indexOf(getSchoolKey(b.value));
        if (aIndex !== -1 || bIndex !== -1) {
          return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
            (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
        }
        return a.label.localeCompare(b.label, 'zh-Hans-CN');
      });
  }, [keywordFilteredPrograms]);

  const filteredPrograms = useMemo(() => {
    const filtered = schoolFilter
      ? keywordFilteredPrograms.filter(p => p.school === schoolFilter)
      : keywordFilteredPrograms;

    return [...filtered].sort(sortByAdmissionChance);
  }, [schoolFilter, keywordFilteredPrograms]);

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
    if (schoolFilter && !schoolFilters.some(item => item.value === schoolFilter)) {
      setSchoolFilter('');
    }
  }, [schoolFilter, schoolFilters]);

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

  const toggleProgramDetails = async (programId) => {
    const isExpanded = expandedProgramIds.has(programId);
    setExpandedProgramIds(prev => {
      const next = new Set(prev);
      if (isExpanded) {
        next.delete(programId);
      } else {
        next.add(programId);
      }
      return next;
    });

    // 收起、正在请求或已经成功加载时不重复调用接口
    if (isExpanded || wayToCalLoading.has(programId) || wayToCalByMajor[programId]) return;

    setWayToCalLoading(prev => new Set(prev).add(programId));
    setWayToCalFailed(prev => {
      const next = new Set(prev);
      next.delete(programId);
      return next;
    });

    const result = await queryMajorDetailByMajorId(programId);
    if (result.success) {
      setWayToCalByMajor(prev => ({
        ...prev,
        [programId]: result.data.wayToCal
      }));
    } else {
      setWayToCalFailed(prev => new Set(prev).add(programId));
    }

    setWayToCalLoading(prev => {
      const next = new Set(prev);
      next.delete(programId);
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
            <Input placeholder="筛选专业" value={programFilter} onChange={setProgramFilter} />
          </div>

          <div className="school-filter-panel" aria-label="按学校筛选专业">
            <button
              type="button"
              className={`school-filter-chip ${schoolFilter === '' ? 'active' : ''}`}
              onClick={() => setSchoolFilter('')}
            >
              <span>可报专业</span>
              <strong>{keywordFilteredPrograms.length}</strong>
            </button>
            {schoolFilters.map(item => (
              <button
                key={item.value}
                type="button"
                className={`school-filter-chip ${schoolFilter === item.value ? 'active' : ''}`}
                onClick={() => setSchoolFilter(item.value)}
                title={item.value}
              >
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </button>
            ))}
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
                const matchInfo = getMatchLevel(program.totalScore, program.middleScore, program.lowScore, program.heightScore);
                const matchColor = matchInfo ? matchInfo.color : '#94a3b8';
                const scoreYears = getSortedYears(program.heightScore, program.middleScore, program.lowScore);
                const admissionYears = getSortedYears(program.admissionCount);
                const allYears = getSortedYears(program.heightScore, program.middleScore, program.lowScore, program.admissionCount, program.yearToScore);
                const isExpanded = expandedProgramIds.has(program.id);

                return (
                  <div key={program.id} className={`rc-card ${isExpanded ? 'expanded' : ''}`}>
                    <div
                      className="rc-summary"
                      onClick={() => toggleProgramDetails(program.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          toggleProgramDetails(program.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                    >
                      <div className="rc-summary-main">
                        <div className="rc-summary-meta">
                          <span className="rc-school">{program.school}</span>
                          <span className="rc-id">ID: {program.id}</span>
                        </div>
                        <div className="rc-title">{program.program}</div>
                      </div>

                      <div className="rc-summary-score">
                        {program.totalScore != null && (
                          <div className="rc-total-score">
                            <span className="rc-total-score-label">总分</span>
                            <span className="rc-total-score-value">{program.totalScore.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {matchInfo && (
                        <div className="rc-match">
                          <span className="rc-match-label">录取概率</span>
                          <div className="rc-match-bar">
                            <div
                              className="rc-match-fill"
                              style={{
                                width: matchInfo.level === 'excellent' ? '100%' :
                                       matchInfo.level === 'good' ? '75%' :
                                       matchInfo.level === 'medium' ? '50%' : '25%',
                                background: matchColor
                              }}
                            />
                          </div>
                          <span className="rc-match-value" style={{ color: matchColor }}>{matchInfo.label}</span>
                        </div>
                      )}

                      <div className="rc-summary-actions">
                        <button
                          type="button"
                          className={`favorite-btn ${favorites.includes(program.id) ? 'favorited' : ''}`}
                          disabled={favLoading.has(program.id)}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleFavorite(program.id);
                          }}
                          onKeyDown={(event) => event.stopPropagation()}
                          style={favLoading.has(program.id) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          {favLoading.has(program.id) ? '...' : favorites.includes(program.id) ? '★' : '☆'}
                        </button>
                        <span className="rc-expand-indicator">{isExpanded ? '收起' : '展开'}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="rc-details">
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
                                <span className="rc-tag-value">
                                  {program.yearToScore?.[year] != null
                                    ? program.yearToScore[year].toFixed(2)
                                    : '-'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="rc-tag rc-tag-score">
                              <span className="rc-tag-label">计分</span>
                              <span className="rc-tag-value">
                                {program.totalScore != null
                                  ? program.totalScore.toFixed(2)
                                  : '-'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 计分科目 */}
                        {program.totalSubjectScore && Object.keys(program.totalSubjectScore).length > 0 && (
                          <div className="rc-subjects">
                            <span className="rc-subjects-label">各科加权得分：</span>
                            <span className="rc-calc-tags">
                              {Object.entries(program.totalSubjectScore).map(([subject, score]) => (
                                <span key={subject} className="rc-subject-tag">
                                  <span className="rc-subject-name">{subject}</span>
                                  <span className="rc-subject-score">{score ?? '-'}</span>
                                </span>
                              ))}
                            </span>
                          </div>
                        )}

                        {/* 各年录取分数线 - 横向卡片 */}
                        {scoreYears.length > 0 && (
                          <div className="rc-score-cards">
                            {scoreYears.map(year => {
                              const wayToCal = wayToCalByMajor[program.id]?.[year];
                              const isWayToCalLoading = wayToCalLoading.has(program.id);
                              const isWayToCalFailed = wayToCalFailed.has(program.id);

                              return (
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
                                  <div className="rc-score-method">
                                    <div className="rc-score-method-title">计分方式</div>
                                    {isWayToCalLoading ? (
                                      <div className="rc-score-method-empty">加载中...</div>
                                    ) : isWayToCalFailed ? (
                                      <div className="rc-score-method-empty">加载失败，收起后可重试</div>
                                    ) : wayToCal != null && wayToCal !== '' ? (
                                      <div className="rc-score-method-value">{wayToCal}</div>
                                    ) : (
                                      <div className="rc-score-method-empty">-</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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
