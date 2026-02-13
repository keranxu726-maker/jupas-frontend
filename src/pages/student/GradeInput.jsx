import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentTabs from '../../components/StudentTabs';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { REQUIRED_SUBJECTS, GRADE_LEVELS, GRADE_SCORES } from '../../constants/subjects';
import { calculatePrograms, getCurrentUser } from '../../utils/api';
import './GradeInput.css';

const GradeInput = () => {
  const navigate = useNavigate();
  const [requiredGrades, setRequiredGrades] = useState({
    'Chinese Language': '5**',
    'English Language': '5**',
    'Mathematics Compulsory Part': '5**',
    'Citizenship and Social Development': '5**'
  });

  const [electiveSubjects, setElectiveSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradeOptions = GRADE_LEVELS.map(g => ({ value: g, label: g }));

  // 从登录用户信息中读取选修科目列表
  useEffect(() => {
    const userInfo = getCurrentUser();
    if (userInfo && userInfo.electiveSubjectList) {
      const electives = userInfo.electiveSubjectList.map(item => ({
        subject: item.englishName || item,
        alias: item.alias || '',
        grade: '5**'
      }));
      setElectiveSubjects(electives);
    }
  }, []);

  const handleRequiredGradeChange = (subject, grade) => {
    setRequiredGrades({ ...requiredGrades, [subject]: grade });
    setError('');
  };

  const handleElectiveGradeChange = (index, grade) => {
    const newElectives = [...electiveSubjects];
    newElectives[index].grade = grade;
    setElectiveSubjects(newElectives);
    setError('');
  };

  const canCalculate = () => {
    const requiredFilled = Object.values(requiredGrades).every(g => g !== '');
    const electivesFilled = electiveSubjects.length > 0 &&
      electiveSubjects.every(e => e.grade !== '');
    return requiredFilled && electivesFilled;
  };

  const handleCalculate = async () => {
    if (!canCalculate()) {
      setError('请完成所有科目成绩的选择');
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
                      options={gradeOptions}
                      placeholder="请选择"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grade-card">
            <div className="card-header">
              <h3>选修科目</h3>
            </div>
            <div className="card-body">
              {electiveSubjects.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  暂无选修科目，请联系管理员配置
                </div>
              )}
              {electiveSubjects.map((item, index) => (
                <div key={index} className="subject-row">
                  <div className="subject-name">{item.subject}</div>
                  <div className="subject-grade">
                    <Select
                      value={item.grade}
                      onChange={(grade) => handleElectiveGradeChange(index, grade)}
                      options={gradeOptions}
                      placeholder="请选择"
                    />
                  </div>
                </div>
              ))}
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
                请完成所有科目成绩的选择
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeInput;
