export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    username: 'student1',
    password: '123456',
    role: 'student',
    points: 10
  }
];

export const mockPrograms = [
  {
    id: 'P001',
    school: '香港大学',
    program: '计算机科学',
    totalScore: 28,
    historyScore: { max: 32, min: 26, median: 29 },
    successRate: 'high'
  },
  {
    id: 'P002',
    school: '香港大学',
    program: '工商管理',
    totalScore: 27,
    historyScore: { max: 31, min: 25, median: 28 },
    successRate: 'high'
  },
  {
    id: 'P003',
    school: '香港中文大学',
    program: '医学',
    totalScore: 32,
    historyScore: { max: 35, min: 30, median: 33 },
    successRate: 'low'
  },
  {
    id: 'P004',
    school: '香港中文大学',
    program: '法律',
    totalScore: 30,
    historyScore: { max: 34, min: 28, median: 31 },
    successRate: 'medium'
  },
  {
    id: 'P005',
    school: '香港科技大学',
    program: '工程学',
    totalScore: 26,
    historyScore: { max: 30, min: 24, median: 27 },
    successRate: 'high'
  },
  {
    id: 'P006',
    school: '香港科技大学',
    program: '数据科学',
    totalScore: 29,
    historyScore: { max: 33, min: 27, median: 30 },
    successRate: 'medium'
  }
];

export const getFavorites = () => {
  const userId = localStorage.getItem('userId');
  const key = `favorites_${userId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveFavorites = (favorites) => {
  const userId = localStorage.getItem('userId');
  const key = `favorites_${userId}`;
  localStorage.setItem(key, JSON.stringify(favorites));
};

export const toggleFavorite = (programId) => {
  const favorites = getFavorites();
  const index = favorites.indexOf(programId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(programId);
  }
  
  saveFavorites(favorites);
  return favorites;
};










