import React, { useState, useEffect, useRef } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import { getAllPrograms, addMajor, editMajor, deleteMajor } from '../../utils/api';
import { REQUIRED_SUBJECTS, ELECTIVE_SUBJECTS, GRADE_LEVELS, SUBJECT_ALIAS_MAP } from '../../constants/subjects';
import './Programs.css';

// 所有科目（必选+选修）
const ALL_SUBJECTS = [...REQUIRED_SUBJECTS, ...ELECTIVE_SUBJECTS];
const SUBJECT_OPTIONS = ALL_SUBJECTS.map(englishName => ({
  value: SUBJECT_ALIAS_MAP[englishName] || englishName,
  label: englishName
}));

const GRADE_OPTIONS = GRADE_LEVELS.map(g => ({ value: g, label: g }));

// 计分类型选项
const CALCULATE_TYPE_OPTIONS = [
  { value: 1, label: '标准计算（Best N）' },
  { value: 2, label: '自定义计算' }
];

const PAGE_SIZE = 30;

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterRegYear, setFilterRegYear] = useState('');
  const [filterMajorId, setFilterMajorId] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterOptions, setFilterOptions] = useState({ years: [], majorIds: [], schools: [] });
  const filterInitRef = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    majorId: '',
    majorName: '',
    schoolName: '',
    regYear: new Date().getFullYear(),
    heightScore: '',
    middleScore: '',
    lowScore: '',
    admissionCount: '',
    majorDetailLink: '',
    remark: '',
    calculateType: 1,
    bestCount: 2,
    subjectReqLevel: [],
    compulsorySubjects: [],
    electiveSubjects: [],
    rewardRules: []
  });

  // 初始加载筛选选项
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    const result = await getAllPrograms(1, 10000);
    if (result.success) {
      const data = result.data;
      const years = [...new Set(data.map(p => p.regYear).filter(Boolean))].sort((a, b) => b - a);
      const majorIds = [...new Set(data.map(p => p.id).filter(Boolean))].sort();
      const schools = [...new Set(data.map(p => p.school).filter(Boolean))].sort();
      setFilterOptions({
        years: years.map(y => ({ value: String(y), label: String(y) })),
        majorIds: majorIds.map(id => ({ value: id, label: id })),
        schools: schools.map(s => ({ value: s, label: s }))
      });
    }
  };

  // 初始加载 + 筛选条件变化时重新请求（重置到第1页）
  useEffect(() => {
    if (!filterInitRef.current) {
      filterInitRef.current = true;
      loadPrograms(1);
      return;
    }
    const timer = setTimeout(() => {
      setCurPage(1);
      loadPrograms(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterRegYear, filterMajorId, filterSchool]);

  const loadPrograms = async (page) => {
    const p = page || curPage;
    const filters = {
      regYear: filterRegYear,
      majorId: filterMajorId,
      majorSchoolName: filterSchool
    };
    const result = await getAllPrograms(p, PAGE_SIZE, filters);
    if (result.success) {
      setPrograms(result.data);
      setTotal(result.total || 0);
      setCurPage(p);
    } else {
      alert(result.message || '获取专业列表失败');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    loadPrograms(page);
  };

  const resetForm = () => ({
    majorId: 'TEST-' + Date.now(),
    majorName: '测试专业',
    schoolName: '测试大学',
    regYear: new Date().getFullYear(),
    heightScore: '25',
    middleScore: '23',
    lowScore: '21',
    admissionCount: '50',
    majorDetailLink: '',
    remark: '',
    calculateType: 1,
    bestCount: 2,
    subjectReqLevel: [
      { subjectAlias: 'chi', subjectLevel: '3' },
      { subjectAlias: 'eng', subjectLevel: '3' },
      { subjectAlias: 'math', subjectLevel: '3' }
    ],
    compulsorySubjects: [],
    electiveSubjects: [],
    rewardRules: []
  });

  const handleAdd = () => {
    setEditingProgram(null);
    setFormData(resetForm());
    setModalOpen(true);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      id: program.dbId,
      majorId: program.id,
      majorName: program.program,
      schoolName: program.school,
      regYear: program.regYear || new Date().getFullYear(),
      heightScore: program.historyScore.max || '',
      middleScore: program.historyScore.median || '',
      lowScore: program.historyScore.min || '',
      admissionCount: program.admissionCount || '',
      majorDetailLink: program.majorDetailLink || '',
      remark: program.remark || '',
      calculateType: program.calculateType || 1,
      bestCount: program.bestCount || 2,
      subjectReqLevel: program.subjectReqLevel || [],
      compulsorySubjects: program.compulsorySubjects || [],
      electiveSubjects: program.electiveSubjects || [],
      rewardRules: program.rewardRules || []
    });
    setModalOpen(true);
  };

  const handleCopy = (program) => {
    setEditingProgram(null);
    setFormData({
      majorId: program.id + '-COPY',
      majorName: program.program,
      schoolName: program.school,
      regYear: program.regYear || new Date().getFullYear(),
      heightScore: program.historyScore.max || '',
      middleScore: program.historyScore.median || '',
      lowScore: program.historyScore.min || '',
      admissionCount: program.admissionCount || '',
      majorDetailLink: program.majorDetailLink || '',
      remark: program.remark || '',
      calculateType: program.calculateType || 1,
      bestCount: program.bestCount || 2,
      subjectReqLevel: JSON.parse(JSON.stringify(program.subjectReqLevel || [])),
      compulsorySubjects: JSON.parse(JSON.stringify(program.compulsorySubjects || [])),
      electiveSubjects: JSON.parse(JSON.stringify(program.electiveSubjects || [])),
      rewardRules: JSON.parse(JSON.stringify(program.rewardRules || []))
    });
    setModalOpen(true);
  };

  // ===== 科目要求区 =====
  const handleAddSubjectReq = () => {
    setFormData({
      ...formData,
      subjectReqLevel: [...formData.subjectReqLevel, { subjectAlias: '', subjectLevel: '' }]
    });
  };

  const handleRemoveSubjectReq = (index) => {
    setFormData({
      ...formData,
      subjectReqLevel: formData.subjectReqLevel.filter((_, i) => i !== index)
    });
  };

  const handleSubjectReqChange = (index, field, value) => {
    const newReqs = [...formData.subjectReqLevel];
    newReqs[index][field] = value;
    setFormData({ ...formData, subjectReqLevel: newReqs });
  };

  // ===== 计分方式区 - 计分必选科目 =====
  const handleAddCompulsorySubject = () => {
    setFormData({
      ...formData,
      compulsorySubjects: [
        ...formData.compulsorySubjects,
        { subjectAliasList: [], subjectWeight: '' }
      ]
    });
  };

  const handleRemoveCompulsorySubject = (index) => {
    setFormData({
      ...formData,
      compulsorySubjects: formData.compulsorySubjects.filter((_, i) => i !== index)
    });
  };

  const handleCompulsorySubjectChange = (index, field, value) => {
    const newSubjects = [...formData.compulsorySubjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, compulsorySubjects: newSubjects });
  };

  const handleCompulsoryAliasChange = (index, value) => {
    const newSubjects = [...formData.compulsorySubjects];
    if (!newSubjects[index].subjectAliasList.includes(value)) {
      newSubjects[index].subjectAliasList = [...newSubjects[index].subjectAliasList, value];
    }
    setFormData({ ...formData, compulsorySubjects: newSubjects });
  };

  const handleRemoveCompulsoryAlias = (subjectIndex, aliasIndex) => {
    const newSubjects = [...formData.compulsorySubjects];
    newSubjects[subjectIndex].subjectAliasList = newSubjects[subjectIndex].subjectAliasList.filter((_, i) => i !== aliasIndex);
    setFormData({ ...formData, compulsorySubjects: newSubjects });
  };

  // ===== 计分方式区 - 计分非必选科目 =====
  const handleAddElectiveSubject = () => {
    setFormData({
      ...formData,
      electiveSubjects: [
        ...formData.electiveSubjects,
        { subjectAliasList: [], subjectWeight: '' }
      ]
    });
  };

  const handleRemoveElectiveSubject = (index) => {
    setFormData({
      ...formData,
      electiveSubjects: formData.electiveSubjects.filter((_, i) => i !== index)
    });
  };

  const handleElectiveSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.electiveSubjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, electiveSubjects: newSubjects });
  };

  const handleElectiveAliasChange = (index, value) => {
    const newSubjects = [...formData.electiveSubjects];
    if (!newSubjects[index].subjectAliasList.includes(value)) {
      newSubjects[index].subjectAliasList = [...newSubjects[index].subjectAliasList, value];
    }
    setFormData({ ...formData, electiveSubjects: newSubjects });
  };

  const handleRemoveElectiveAlias = (subjectIndex, aliasIndex) => {
    const newSubjects = [...formData.electiveSubjects];
    newSubjects[subjectIndex].subjectAliasList = newSubjects[subjectIndex].subjectAliasList.filter((_, i) => i !== aliasIndex);
    setFormData({ ...formData, electiveSubjects: newSubjects });
  };

  // ===== 奖励分区 =====
  const handleAddRewardRule = () => {
    setFormData({
      ...formData,
      rewardRules: [...formData.rewardRules, { subjectNo: '', subjectWeight: '' }]
    });
  };

  const handleRemoveRewardRule = (index) => {
    setFormData({
      ...formData,
      rewardRules: formData.rewardRules.filter((_, i) => i !== index)
    });
  };

  const handleRewardRuleChange = (index, field, value) => {
    const newRules = [...formData.rewardRules];
    newRules[index][field] = value;
    setFormData({ ...formData, rewardRules: newRules });
  };

  const SUBJECT_NO_OPTIONS = [
    { value: '6', label: '第6科' },
    { value: '7', label: '第7科' }
  ];

  const handleSave = async () => {
    // 验证必填字段
    if (!formData.majorId || !formData.majorName || !formData.schoolName) {
      alert('请填写专业ID、专业名称和学校名称');
      return;
    }

    if (formData.subjectReqLevel.length === 0) {
      alert('请至少添加1个科目等级要求');
      return;
    }

    // 验证每个科目等级要求
    for (let i = 0; i < formData.subjectReqLevel.length; i++) {
      const req = formData.subjectReqLevel[i];
      if (!req.subjectAlias || !req.subjectLevel) {
        alert(`请完整填写第 ${i + 1} 个科目等级要求`);
        return;
      }
    }

    const majorData = {
      ...formData,
      heightScore: formData.heightScore ? parseFloat(formData.heightScore) : null,
      middleScore: formData.middleScore ? parseFloat(formData.middleScore) : null,
      lowScore: formData.lowScore ? parseFloat(formData.lowScore) : null
    };

    let result;
    if (editingProgram) {
      result = await editMajor(majorData);
    } else {
      result = await addMajor(majorData);
    }

    if (result.success) {
      alert(result.message || (editingProgram ? '编辑成功' : '添加成功'));
      setModalOpen(false);
      loadFilterOptions();
      loadPrograms(curPage);
    } else {
      alert(result.message || '操作失败');
    }
  };

  const handleDelete = async (program) => {
    if (window.confirm(`确认删除专业：${program.school} - ${program.program}?`)) {
      const result = await deleteMajor(program.dbId);
      if (result.success) {
        alert(result.message || '删除成功');
        loadFilterOptions();
        loadPrograms(curPage);
      } else {
        alert(result.message || '删除失败');
      }
    }
  };

  return (
    <div className="programs-section">
      <div className="section-header">
        <h2>专业数据管理</h2>
        <Button onClick={handleAdd}>+ 添加专业</Button>
      </div>

      <div className="search-bar" style={{ display: 'flex', gap: '12px' }}>
        <Select
          placeholder="注册年份"
          value={filterRegYear}
          onChange={setFilterRegYear}
          options={[{ value: '', label: '全部年份' }, ...filterOptions.years]}
          searchable={true}
        />
        <Select
          placeholder="专业ID"
          value={filterMajorId}
          onChange={setFilterMajorId}
          options={[{ value: '', label: '全部专业' }, ...filterOptions.majorIds]}
          searchable={true}
        />
        <Select
          placeholder="学校名称"
          value={filterSchool}
          onChange={setFilterSchool}
          options={[{ value: '', label: '全部学校' }, ...filterOptions.schools]}
          searchable={true}
        />
      </div>

      <div className="programs-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>学校</th>
              <th>专业</th>
              <th>最高分</th>
              <th>最低分</th>
              <th>中位数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(program => (
              <tr key={program.dbId || program.id}>
                <td>{program.id}</td>
                <td>{program.school}</td>
                <td>{program.program}</td>
                <td>{program.historyScore.max}</td>
                <td>{program.historyScore.min}</td>
                <td>{program.historyScore.median}</td>
                <td>
                  <div className="table-actions">
                    <Button size="small" onClick={() => handleCopy(program)}>
                      复制
                    </Button>
                    <Button size="small" onClick={() => handleEdit(program)}>
                      编辑
                    </Button>
                    <Button size="small" type="danger" onClick={() => handleDelete(program)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {programs.length === 0 && (
          <div className="empty-table">
            {(filterRegYear || filterMajorId || filterSchool) ? '未找到匹配的专业' : '暂无数据'}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        fontSize: '14px',
        color: '#64748b'
      }}>
        <span>共 {total} 条记录，第 {curPage}/{totalPages} 页</span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            onClick={() => handlePageChange(1)}
            disabled={curPage === 1}
            style={{
              padding: '6px 10px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: curPage === 1 ? '#f1f5f9' : 'white',
              color: curPage === 1 ? '#94a3b8' : '#334155',
              cursor: curPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            首页
          </button>
          <button
            onClick={() => handlePageChange(curPage - 1)}
            disabled={curPage === 1}
            style={{
              padding: '6px 10px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: curPage === 1 ? '#f1f5f9' : 'white',
              color: curPage === 1 ? '#94a3b8' : '#334155',
              cursor: curPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            上一页
          </button>
          <button
            onClick={() => handlePageChange(curPage + 1)}
            disabled={curPage >= totalPages}
            style={{
              padding: '6px 10px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: curPage >= totalPages ? '#f1f5f9' : 'white',
              color: curPage >= totalPages ? '#94a3b8' : '#334155',
              cursor: curPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            下一页
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={curPage >= totalPages}
            style={{
              padding: '6px 10px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: curPage >= totalPages ? '#f1f5f9' : 'white',
              color: curPage >= totalPages ? '#94a3b8' : '#334155',
              cursor: curPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            末页
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProgram ? '编辑专业' : '添加专业'}
        width="900px"
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '15px' }}>
          {/* 1. 基础信息区 */}
          <Section title="1. 基础信息">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <Input
                label="专业编号 *"
                value={formData.majorId}
                onChange={(v) => setFormData({ ...formData, majorId: v })}
                placeholder="如：JS1001"
              />
              <Input
                label="专业名称 *"
                value={formData.majorName}
                onChange={(v) => setFormData({ ...formData, majorName: v })}
                placeholder="如：计算机科学"
              />
              <Input
                label="学校名称 *"
                value={formData.schoolName}
                onChange={(v) => setFormData({ ...formData, schoolName: v })}
                placeholder="如：香港大学"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <Input
                label="注册年份 *"
                type="number"
                value={formData.regYear}
                onChange={(v) => setFormData({ ...formData, regYear: parseInt(v) || new Date().getFullYear() })}
              />
              <Input
                label="录取人数"
                value={formData.admissionCount}
                onChange={(v) => setFormData({ ...formData, admissionCount: v })}
                placeholder="如：50"
              />
              <Select
                label="计算类型"
                value={formData.calculateType}
                onChange={(v) => setFormData({ ...formData, calculateType: parseInt(v) || 1 })}
                options={CALCULATE_TYPE_OPTIONS}
                placeholder="选择计算类型"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <Input
                label="最高分"
                type="number"
                step="0.01"
                value={formData.heightScore}
                onChange={(v) => setFormData({ ...formData, heightScore: v })}
                placeholder="如：25.5"
              />
              <Input
                label="中位数"
                type="number"
                step="0.01"
                value={formData.middleScore}
                onChange={(v) => setFormData({ ...formData, middleScore: v })}
                placeholder="如：23.0"
              />
              <Input
                label="最低分"
                type="number"
                step="0.01"
                value={formData.lowScore}
                onChange={(v) => setFormData({ ...formData, lowScore: v })}
                placeholder="如：21.5"
              />
            </div>

            <Input
              label="详情链接"
              value={formData.majorDetailLink}
              onChange={(v) => setFormData({ ...formData, majorDetailLink: v })}
              placeholder="https://..."
              style={{ marginBottom: '16px' }}
            />

            <Input
              label="备注"
              value={formData.remark}
              onChange={(v) => setFormData({ ...formData, remark: v })}
              placeholder="备注信息"
              style={{ marginBottom: '0' }}
            />
          </Section>

          {/* 2. 科目要求区 */}
          <Section title="2. 科目要求区" style={{ marginTop: '24px' }}>
            {formData.subjectReqLevel.map((req, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: '8px',
                marginBottom: '8px',
                alignItems: 'end',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '6px'
              }}>
                <Select
                  label={index === 0 ? '科目' : ''}
                  value={req.subjectAlias}
                  onChange={(v) => handleSubjectReqChange(index, 'subjectAlias', v)}
                  options={SUBJECT_OPTIONS}
                  placeholder="选择科目"
                  searchable={true}
                />
                <Select
                  label={index === 0 ? '等级要求' : ''}
                  value={req.subjectLevel}
                  onChange={(v) => handleSubjectReqChange(index, 'subjectLevel', v)}
                  options={GRADE_OPTIONS}
                  placeholder="等级"
                />
                <button
                  onClick={() => handleRemoveSubjectReq(index)}
                  style={{
                    padding: '10px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              </div>
            ))}
            <button
              onClick={handleAddSubjectReq}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              + 添加科目要求
            </button>
          </Section>

          {/* 3. 计分方式区 */}
          <Section title="3. 计分方式区" style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                最佳 N 科（Best N）*
              </label>
              <Input
                type="number"
                value={formData.bestCount}
                onChange={(v) => setFormData({ ...formData, bestCount: parseInt(v) || 2 })}
                placeholder="如：2"
                style={{ maxWidth: '200px' }}
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', margin: 0 }}>
                从所有科目中选择分数最高的 N 科计入总分
              </p>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>计分必选科目</label>
                <button
                  onClick={handleAddCompulsorySubject}
                  style={{
                    padding: '6px 12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  + 添加必选科目组
                </button>
              </div>

              {formData.compulsorySubjects.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  无计分必选科目（所有科目平等计算）
                </div>
              ) : (
                formData.compulsorySubjects.map((subject, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                        必选科目列表
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        {subject.subjectAliasList.map((alias, aliasIndex) => (
                          <span
                            key={aliasIndex}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              background: '#dcfce7',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#166534'
                            }}
                          >
                            {SUBJECT_OPTIONS.find(o => o.value === alias)?.label || alias}
                            <button
                              onClick={() => handleRemoveCompulsoryAlias(index, aliasIndex)}
                              style={{
                                marginLeft: '6px',
                                background: 'none',
                                border: 'none',
                                color: '#166534',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '0'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <Select
                        value=""
                        onChange={(v) => handleCompulsoryAliasChange(index, v)}
                        options={SUBJECT_OPTIONS.filter(o => !subject.subjectAliasList.includes(o.value))}
                        placeholder="+ 添加科目"
                        searchable={true}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input
                        label="权重系数"
                        value={subject.subjectWeight}
                        onChange={(v) => handleCompulsorySubjectChange(index, 'subjectWeight', v)}
                        placeholder="如：1.5"
                      />
                      <div style={{ display: 'flex', alignItems: 'end' }}>
                        <button
                          onClick={() => handleRemoveCompulsorySubject(index)}
                          style={{
                            padding: '8px 16px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          删除此组
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>计分非必选科目</label>
                <button
                  onClick={handleAddElectiveSubject}
                  style={{
                    padding: '6px 12px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  + 添加非必选科目组
                </button>
              </div>

              {formData.electiveSubjects.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  无计分非必选科目
                </div>
              ) : (
                formData.electiveSubjects.map((subject, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                        非必选科目列表
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        {subject.subjectAliasList.map((alias, aliasIndex) => (
                          <span
                            key={aliasIndex}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              background: '#e0e7ff',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#3730a3'
                            }}
                          >
                            {SUBJECT_OPTIONS.find(o => o.value === alias)?.label || alias}
                            <button
                              onClick={() => handleRemoveElectiveAlias(index, aliasIndex)}
                              style={{
                                marginLeft: '6px',
                                background: 'none',
                                border: 'none',
                                color: '#3730a3',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '0'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <Select
                        value=""
                        onChange={(v) => handleElectiveAliasChange(index, v)}
                        options={SUBJECT_OPTIONS.filter(o => !subject.subjectAliasList.includes(o.value))}
                        placeholder="+ 添加科目"
                        searchable={true}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input
                        label="权重系数"
                        value={subject.subjectWeight}
                        onChange={(v) => handleElectiveSubjectChange(index, 'subjectWeight', v)}
                        placeholder="如：1.5"
                      />
                      <div style={{ display: 'flex', alignItems: 'end' }}>
                        <button
                          onClick={() => handleRemoveElectiveSubject(index)}
                          style={{
                            padding: '8px 16px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          删除此组
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Section>

          {/* 4. 奖励分区 */}
          <Section title="4. 奖励分区" style={{ marginTop: '24px' }}>
            {formData.rewardRules.map((rule, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '8px',
                marginBottom: '8px',
                alignItems: 'end',
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '6px'
              }}>
                <Select
                  label={index === 0 ? '科目' : ''}
                  value={rule.subjectNo}
                  onChange={(v) => handleRewardRuleChange(index, 'subjectNo', v)}
                  options={SUBJECT_NO_OPTIONS}
                  placeholder="选择第N科"
                />
                <Input
                  label={index === 0 ? '权重系数' : ''}
                  value={rule.subjectWeight}
                  onChange={(v) => handleRewardRuleChange(index, 'subjectWeight', v)}
                  placeholder="如：0.5"
                />
                <button
                  onClick={() => handleRemoveRewardRule(index)}
                  style={{
                    padding: '10px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              </div>
            ))}
            {formData.rewardRules.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                无奖励分规则
              </div>
            )}
            <button
              onClick={handleAddRewardRule}
              style={{
                padding: '8px 16px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              + 添加奖励规则
            </button>
          </Section>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button type="secondary" onClick={() => setModalOpen(false)}>
            取消
          </Button>
          <Button type="primary" onClick={handleSave}>
            {editingProgram ? '保存' : '添加'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// 分区组件
const Section = ({ title, children, style }) => (
  <div style={{
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    ...style
  }}>
    <h3 style={{
      margin: '0 0 16px 0',
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      paddingBottom: '12px',
      borderBottom: '2px solid #3b82f6'
    }}>
      {title}
    </h3>
    {children}
  </div>
);

export default Programs;
