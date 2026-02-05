import { getFavorites, toggleFavorite } from './mockData';
import { GRADE_SCORES, SUBJECT_ALIAS_MAP } from '../constants/subjects';

// 开发环境使用代理，生产环境直接请求后端
const BASE_URL = import.meta.env.DEV ? '' : 'http://121.40.28.153:8080';
const API_PREFIX = `${BASE_URL}/api`;

const jsonRequest = async (path, options = {}) => {
  try {
    const res = await fetch(`${API_PREFIX}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const data = await res.json();
    if (data.code !== 0) {
      return { success: false, message: data.msg || '接口调用失败', raw: data };
    }
    return { success: true, data: data.data, raw: data };
  } catch (e) {
    return { success: false, message: e.message || '网络错误' };
  }
};

// 用于文件上传的请求
const multipartRequest = async (path, formData) => {
  try {
    const res = await fetch(`${API_PREFIX}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json();
    if (data.code !== 0) {
      return { success: false, message: data.msg || '接口调用失败', raw: data };
    }
    return { success: true, data: data.data, raw: data };
  } catch (e) {
    return { success: false, message: e.message || '网络错误' };
  }
};

export const login = async (username, password) => {
  const result = await jsonRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ name: username, password })
  });

  if (!result.success) {
    return { success: false, message: result.message || '用户名或密码错误' };
  }

  const backendUser = result.data || {};
  const userInfo = {
    id: backendUser.userId,
    username: backendUser.userName,
    role: (backendUser.userType || '').toLowerCase().includes('admin') ? 'admin' : 'student',
    electiveSubjectList: backendUser.electiveSubjectList || []
  };

  localStorage.setItem('userId', userInfo.id);
  localStorage.setItem('userInfo', JSON.stringify(userInfo));

  return { success: true, data: userInfo };
};

export const logout = async () => {
  await jsonRequest('/users/logout', { method: 'POST' });
  localStorage.removeItem('userId');
  localStorage.removeItem('userInfo');
};

export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const getUserInfo = async () => {
  const result = await jsonRequest('/users/getUserInfo', { method: 'POST' });
  if (!result.success) {
    return { success: false, message: result.message || '获取用户信息失败' };
  }
  const backendUser = result.data || {};
  const userInfo = {
    id: backendUser.userId,
    username: backendUser.userName,
    role: (backendUser.userType || '').toLowerCase().includes('admin') ? 'admin' : 'student',
    electiveSubjectList: backendUser.electiveSubjectList || []
  };
  return { success: true, data: userInfo };
};

// 成绩计算 - 使用前端本地计算逻辑
export const calculatePrograms = async (grades) => {
  let totalScore = 0;

  Object.values(grades.requiredSubjects).forEach(grade => {
    totalScore += GRADE_SCORES[grade] || 0;
  });

  grades.electiveSubjects.forEach(item => {
    totalScore += GRADE_SCORES[item.grade] || 0;
  });

  // 获取所有专业并计算匹配度
  const programsResult = await getAllPrograms();
  if (!programsResult.success) {
    return { success: false, message: '获取专业数据失败' };
  }

  const suitablePrograms = programsResult.data.filter(program => {
    const minScore = program.historyScore.min - 3;
    const maxScore = program.historyScore.max + 3;
    return totalScore >= minScore && totalScore <= maxScore;
  }).map(program => {
    let successRate = 'medium';
    if (totalScore >= program.historyScore.median + 2) {
      successRate = 'high';
    } else if (totalScore < program.historyScore.min) {
      successRate = 'low';
    }

    return {
      ...program,
      successRate,
      userScore: totalScore
    };
  });

  suitablePrograms.sort((a, b) => {
    const rateOrder = { high: 0, medium: 1, low: 2 };
    if (rateOrder[a.successRate] !== rateOrder[b.successRate]) {
      return rateOrder[a.successRate] - rateOrder[b.successRate];
    }
    return b.userScore - a.userScore;
  });

  return {
    success: true,
    data: {
      totalScore,
      programs: suitablePrograms
    }
  };
};

export const getFavoritePrograms = async () => {
  const favoriteIds = getFavorites();
  const programsResult = await getAllPrograms();
  if (!programsResult.success) {
    return { success: false, message: '获取专业数据失败' };
  }
  const programs = programsResult.data.filter(p => favoriteIds.includes(p.id));
  return { success: true, data: programs };
};

export const toggleFavoriteProgram = async (programId) => {
  const favorites = toggleFavorite(programId);
  return { success: true, data: favorites };
};

export const resetPassword = async (oldPassword, newPassword) => {
  const result = await jsonRequest('/users/resetPassword', {
    method: 'POST',
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  });

  if (!result.success) {
    return { success: false, message: result.message || '重置密码失败' };
  }

  return { success: true, message: '密码重置成功' };
};

// ==================== 用户管理接口 ====================
// 注意：后端没有提供用户列表接口，所以 getAccounts 暂时不可用
// 单个注册用户
export const createAccount = async (accountData) => {
  // 将选修科目英文名称转换为后端 alias
  const electiveAliases = (accountData.electiveSubjects || []).map(
    subject => SUBJECT_ALIAS_MAP[subject] || subject
  );

  const result = await jsonRequest('/users/singleRegister', {
    method: 'POST',
    body: JSON.stringify({
      name: accountData.username,
      password: accountData.password,
      userType: accountData.role === 'admin' ? 'admin' : 'student',
      electiveSubjects: electiveAliases
    })
  });

  if (!result.success) {
    return { success: false, message: result.message || '创建账号失败' };
  }

  return { success: true, message: '账号创建成功' };
};

// 批量注册用户（Excel上传）
export const batchImportAccounts = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const result = await multipartRequest('/users/batchRegister', formData);

  if (!result.success) {
    return { success: false, message: result.message || '批量导入失败' };
  }

  const errMsgList = result.data || [];
  if (errMsgList.length > 0) {
    return { success: true, hasErrors: true, message: '部分导入成功', errors: errMsgList };
  }

  return { success: true, message: '批量导入成功' };
};

// 后端暂不支持的接口（保留前端模拟数据）
export const getAccounts = async (role) => {
  // 后端没有提供用户列表接口
  return { success: false, message: '后端暂不支持查询用户列表' };
};

export const updateAccount = async (id, accountData) => {
  // 后端没有提供编辑用户接口
  return { success: false, message: '后端暂不支持编辑用户' };
};

export const deleteAccount = async (id) => {
  // 后端没有提供删除用户接口
  return { success: false, message: '后端暂不支持删除用户' };
};

// ==================== 专业管理接口 ====================
export const getAllPrograms = async (curPage = 1, pageSize = 1000) => {
  const result = await jsonRequest('/major/queryMajorPage', {
    method: 'POST',
    body: JSON.stringify({
      curPage,
      pageSize
    })
  });

  if (!result.success) {
    return { success: false, message: result.message || '获取专业列表失败' };
  }

  const page = result.data || {};
  const list = page.list || [];
  const mapped = list.map(item => ({
    id: item.majorId,
    dbId: item.id,
    school: item.schoolName,
    program: item.majorName,
    totalScore: item.middleScore,
    historyScore: {
      max: item.heightScore,
      min: item.lowScore,
      median: item.middleScore
    },
    // 额外信息
    regYear: item.regYear,
    majorDetailLink: item.majorDetailLink,
    admissionCount: item.admissionCount,
    remark: item.remark,
    subjectReqLevel: item.subjectReqLevel,
    calculateType: item.calculateType,
    bestCount: item.bestCount,
    compulsorySubjects: item.compulsorySubjects,
    rewardRules: item.rewardRules,
    opUser: item.opUser
  }));

  return { success: true, data: mapped, total: page.totalCount };
};

// 添加专业
export const addMajor = async (majorData) => {
  const result = await jsonRequest('/major/addMajor', {
    method: 'POST',
    body: JSON.stringify(majorData)
  });

  if (!result.success) {
    return { success: false, message: result.message || '添加专业失败' };
  }

  return { success: true, message: '专业添加成功' };
};

// 编辑专业
export const editMajor = async (majorData) => {
  const result = await jsonRequest('/major/editMajor', {
    method: 'POST',
    body: JSON.stringify(majorData)
  });

  if (!result.success) {
    return { success: false, message: result.message || '编辑专业失败' };
  }

  return { success: true, message: '专业编辑成功' };
};

// 删除专业
export const deleteMajor = async (id) => {
  const result = await jsonRequest('/major/deleteMajor', {
    method: 'POST',
    body: JSON.stringify({ id })
  });

  if (!result.success) {
    return { success: false, message: result.message || '删除专业失败' };
  }

  return { success: true, message: '专业删除成功' };
};
