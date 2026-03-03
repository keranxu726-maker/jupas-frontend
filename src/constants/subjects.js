export const REQUIRED_SUBJECTS = [
  'Chinese Language',
  'English Language',
  'Mathematics Compulsory Part',
  'Citizenship and Social Development'
];

export const ELECTIVE_SUBJECTS = [
  'Biology',
  'Business, Accounting and Financial Studies',
  'Chemistry',
  'Chinese History',
  'Chinese Literature',
  'Combined Science: Biology + Chemistry',
  'Combined Science: Biology + Physics',
  'Combined Science: Physics + Chemistry',
  'Design and Applied Technology',
  'Economics',
  'Ethics and Religious Studies',
  'Geography',
  'Health Management and Social Care',
  'History',
  'Information and Communication Technology',
  'Integrated Science',
  'English Literature',
  'Mathematics Extended Part 1 (Calculus and Statistics)',
  'Mathematics Extended Part 2 (Algebra and Calculus)',
  'Music',
  'Physical Education',
  'Physics',
  'Technology and Living (Fashion, Clothing and Textiles)',
  'Technology and Living (Food Science and Technology)',
  'Tourism and Hospitality Studies',
  'Visual Arts',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Spanish'
];

// 英文名称到后端 alias 的映射（后端验证需要）
export const SUBJECT_ALIAS_MAP = {
  // 必选科目
  'Chinese Language': 'chi',
  'English Language': 'eng',
  'Mathematics Compulsory Part': 'math',
  'Citizenship and Social Development': 'csd',

  // 选修科目
  'Biology': 'bio',
  'Business, Accounting and Financial Studies': 'bafs',
  'Chemistry': 'che',
  'Chinese History': 'chist',
  'Chinese Literature': 'clit',
  'Combined Science: Biology + Chemistry': 'bioche',
  'Combined Science: Biology + Physics': 'biophy',
  'Combined Science: Physics + Chemistry': 'chephy',
  'Design and Applied Technology': 'dat',
  'Economics': 'eco',
  'Ethics and Religious Studies': 'ers',
  'Geography': 'geo',
  'Health Management and Social Care': 'hmsc',
  'History': 'hist',
  'Information and Communication Technology': 'ict',
  'Integrated Science': 'intsci',
  'English Literature': 'elit',
  'Mathematics Extended Part 1 (Calculus and Statistics)': 'm1',
  'Mathematics Extended Part 2 (Algebra and Calculus)': 'm2',
  'Music': 'music',
  'Physical Education': 'pedu',
  'Physics': 'phy',
  'Technology and Living (Fashion, Clothing and Textiles)': 'fct',
  'Technology and Living (Food Science and Technology)': 'fst',
  'Tourism and Hospitality Studies': 'tour',
  'Visual Arts': 'vart',
  'French': 'frn',
  'German': 'gem',
  'Japanese': 'jpn',
  'Korean': 'kre',
  'Spanish': 'spn'
};

export const GRADE_LEVELS = ['5**', '5*', '5', '4', '3', '2', '1', 'U'];

export const GRADE_SCORES = {
  'U': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '5*': 6,
  '5**': 7
};
