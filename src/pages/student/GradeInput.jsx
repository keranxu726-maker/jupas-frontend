import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentTabs from '../../components/StudentTabs';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { REQUIRED_SUBJECTS, ELECTIVE_SUBJECTS, GRADE_LEVELS, GRADE_SCORES } from '../../constants/subjects';
import { calculatePrograms } from '../../utils/api';
import './GradeInput.css';

const GradeInput = () => {
  const navigate = useNavigate();
  const [requiredGrades, setRequiredGrades] = useState({
    'Chinese Language': '',
    'English Language': '',
    'Mathematics Compulsory Part': ''
  });

  const [electiveSubjects, setElectiveSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradeOptions = GRADE_LEVELS.map(g => ({ value: g, label: g }));

  // 为等级添加分数显示
  const gradeOptionsWithScores = GRADE_LEVELS.map(g => ({
    value: g,
    label: `${g} (${GRADE_SCORES[g]}分)`
  }));

  const availableElectives = ELECTIVE_SUBJECTS.filter(
    subject => !electiveSubjects.find(e => e.subject === subject)
  );

  const handleRequiredGradeChange = (subject, grade) => {
    setRequiredGrades({ ...requiredGrades, [subject]: grade });
    setError('');
  };

  const handleAddElective = (subject) => {
    if (subject) {
      setElectiveSubjects([...electiveSubjects, { subject, grade: '' }]);
      setError('');
    }
  };

  const handleElectiveGradeChange = (index, grade) => {
    const newElectives = [...electiveSubjects];
    newElectives[index].grade = grade;
    setElectiveSubjects(newElectives);
    setError('');
  };

  const handleRemoveElective = (index) => {
    const newElectives = electiveSubjects.filter((_, i) => i !== index);
    setElectiveSubjects(newElectives);
  };

  const canCalculate = () => {
    const requiredFilled = Object.values(requiredGrades).every(g => g !== '');
    const electivesFilled = electiveSubjects.length >= 2 &&
      electiveSubjects.every(e => e.grade !== '');
    return requiredFilled && electivesFilled;
  };

  const handleCalculate = async () => {
    if (!canCalculate()) {
      setError('请完成所有必选科目成绩并至少选择2门选修科目');
      return;
    }

    setLoading(true);
    const result = await calculatePrograms({
      requiredSubjects: requiredGrades,
      electiveSubjects
    });
    setLoading(false);

    if (result.success) {
      navigate('/student/result', {
        state: {
          ...result.data,
          grades: {
            required: requiredGrades,
            elective: electiveSubjects
          }
        }
      });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="grade-input-page">
      <Navbar />
      <StudentTabs />

      <div className="page-content">
        <div className="page-container">
          <h2 className="page-title">成绩输入</h2>

          {/* 等级转换说明 */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0369a1' }}>
              📊 等级转换说明
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontSize: '13px' }}>
              {GRADE_LEVELS.map(grade => (
                <div key={grade} style={{
                  padding: '6px 10px',
                  background: 'white',
                  borderRadius: '4px',
                  textAlign: 'center',
                  border: '1px solid #e0f2fe'
                }}>
                  <span style={{ fontWeight: '600', color: '#0284c7' }}>{grade}</span>
                  <span style={{ color: '#64748b', marginLeft: '4px' }}>→ {GRADE_SCORES[grade]}分</span>
                </div>
              ))}
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              💡 提示：等级越高，分数越高。5** 为最高等级（7分），U 为最低等级（0分）。
            </p>
          </div>

          <div className="grade-card">
            <div className="card-header">
              <h3>必选科目</h3>
            </div>
            <div className="card-body">
              {REQUIRED_SUBJECTS.map(subject => (
                <div key={subject} className="subject-row">
                  <div className="subject-name">{subject}</div>
                  <div className="subject-grade">
                    <Select
                      value={requiredGrades[subject]}
                      onChange={(grade) => handleRequiredGradeChange(subject, grade)}
                      options={gradeOptionsWithScores}
                      placeholder="请选择"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grade-card">
            <div className="card-header">
              <h3>选修科目（至少选择2门）</h3>
            </div>
            <div className="card-body">
              {electiveSubjects.map((item, index) => (
                <div key={index} className="subject-row">
                  <div className="subject-name">{item.subject}</div>
                  <div className="subject-grade">
                    <Select
                      value={item.grade}
                      onChange={(grade) => handleElectiveGradeChange(index, grade)}
                      options={gradeOptionsWithScores}
                      placeholder="请选择"
                    />
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveElective(index)}
                    title="删除科目"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="add-subject-row">
                <Select
                  value=""
                  onChange={handleAddElective}
                  options={availableElectives.map(s => ({ value: s, label: s }))}
                  placeholder="+ 添加选修科目"
                  searchable={true}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="calculate-section">
            <Button
              type="primary"
              size="large"
              disabled={!canCalculate() || loading}
              onClick={handleCalculate}
            >
              {loading ? '计算中...' : '计算专业推荐'}
            </Button>

            {!canCalculate() && (
              <div className="hint-text">
                请完成所有必选科目成绩并至少选择2门选修科目
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeInput;
