import { mockUsers, mockPrograms, getFavorites, toggleFavorite } from './mockData';
import { GRADE_SCORES } from '../constants/subjects';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (username, password) => {
  await delay(500);
  
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password: _, ...userInfo } = user;
    localStorage.setItem('token', 'mock-token-' + user.id);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    return { success: true, data: userInfo };
  }
  
  return { success: false, message: '用户名或密码错误' };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userInfo');
};

export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const calculatePrograms = async (grades) => {
  await delay(800);
  
  let totalScore = 0;
  
  Object.values(grades.requiredSubjects).forEach(grade => {
    totalScore += GRADE_SCORES[grade] || 0;
  });
  
  grades.electiveSubjects.forEach(item => {
    totalScore += GRADE_SCORES[item.grade] || 0;
  });
  
  const userInfo = getCurrentUser();
  if (userInfo && userInfo.role === 'student') {
    if (userInfo.points <= 0) {
      return { success: false, message: '权益点数不足' };
    }
    userInfo.points -= 1;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    const user = mockUsers.find(u => u.id === userInfo.id);
    if (user) {
      user.points = userInfo.points;
    }
  }
  
  const suitablePrograms = mockPrograms.filter(program => {
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
  await delay(300);
  
  const favoriteIds = getFavorites();
  const programs = mockPrograms.filter(p => favoriteIds.includes(p.id));
  
  return { success: true, data: programs };
};

export const toggleFavoriteProgram = async (programId) => {
  await delay(200);
  
  const favorites = toggleFavorite(programId);
  return { success: true, data: favorites };
};

export const resetPassword = async (oldPassword, newPassword) => {
  await delay(500);
  
  const userInfo = getCurrentUser();
  const user = mockUsers.find(u => u.id === userInfo.id);
  
  if (user && user.password === oldPassword) {
    user.password = newPassword;
    return { success: true, message: '密码重置成功' };
  }
  
  return { success: false, message: '原密码错误' };
};

export const getAccounts = async (role) => {
  await delay(400);
  const accounts = mockUsers.filter(u => u.role === role);
  return { success: true, data: accounts };
};

export const createAccount = async (accountData) => {
  await delay(400);
  const newAccount = {
    id: Date.now().toString(),
    ...accountData
  };
  mockUsers.push(newAccount);
  return { success: true, data: newAccount };
};

export const updateAccount = async (id, accountData) => {
  await delay(400);
  const index = mockUsers.findIndex(u => u.id === id);
  if (index > -1) {
    mockUsers[index] = { ...mockUsers[index], ...accountData };
    return { success: true, data: mockUsers[index] };
  }
  return { success: false, message: '账号不存在' };
};

export const deleteAccount = async (id) => {
  await delay(400);
  const index = mockUsers.findIndex(u => u.id === id);
  if (index > -1) {
    mockUsers.splice(index, 1);
    return { success: true };
  }
  return { success: false, message: '账号不存在' };
};

export const getAllPrograms = async () => {
  await delay(400);
  return { success: true, data: mockPrograms };
};






