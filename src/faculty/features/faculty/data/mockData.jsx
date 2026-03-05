export const mockStudents = [
  {
    id: 'STU001',
    name: 'Aarav Sharma',
    rollNumber: 'B230486CS',
    program: 'B.Tech',
    department: 'Computer Science',
    semester: 6,
    email: 'aarav.sharma@university.edu',
    phone: '+91 98765 43210',
    status: 'pending',
    submittedDate: '2024-02-05',
    cgpa: 8.5,
    avatar: 'AS'
  },
  {
    id: 'STU002',
    name: 'Diya Patel',
    rollNumber: 'B230487EE',
    program: 'M.Tech',
    department: 'Electrical Engineering',
    semester: 2,
    email: 'diya.patel@university.edu',
    phone: '+91 98765 43211',
    status: 'approved',
    submittedDate: '2024-02-03',
    reviewedDate: '2024-02-04',
    cgpa: 9.2,
    avatar: 'DP'
  },
  {
    id: 'STU003',
    name: 'Arjun Reddy',
    rollNumber: 'P223488ME',
    program: 'PhD',
    department: 'Mechanical Engineering',
    semester: 4,
    email: 'arjun.reddy@university.edu',
    phone: '+91 98765 43212',
    status: 'rejected',
    submittedDate: '2024-02-01',
    reviewedDate: '2024-02-02',
    rejectionReason: 'Incomplete documentation. Please submit attendance certificates.',
    cgpa: 8.8,
    avatar: 'AR'
  },
  {
    id: 'STU004',
    name: 'Ananya Iyer',
    rollNumber: 'B230489EC',
    program: 'B.Tech',
    department: 'Electronics',
    semester: 6,
    email: 'ananya.iyer@university.edu',
    phone: '+91 98765 43213',
    status: 'pending',
    submittedDate: '2024-02-06',
    cgpa: 9.0,
    avatar: 'AI'
  },
  {
    id: 'STU005',
    name: 'Vikram Singh',
    rollNumber: 'M230490CS',
    program: 'M.Tech',
    department: 'Computer Science',
    semester: 3,
    email: 'vikram.singh@university.edu',
    phone: '+91 98765 43214',
    status: 'approved',
    submittedDate: '2024-02-04',
    reviewedDate: '2024-02-05',
    cgpa: 8.7,
    avatar: 'VS'
  },
  {
    id: 'STU006',
    name: 'Priya Nair',
    rollNumber: 'P213491CS',
    program: 'PhD',
    department: 'Computer Science',
    semester: 6,
    email: 'priya.nair@university.edu',
    phone: '+91 98765 43215',
    status: 'pending',
    submittedDate: '2024-02-07',
    cgpa: 9.5,
    avatar: 'PN'
  },
  {
    id: 'STU007',
    name: 'Rohan Desai',
    rollNumber: 'B230492ME',
    program: 'B.Tech',
    department: 'Mechanical Engineering',
    semester: 6,
    email: 'rohan.desai@university.edu',
    phone: '+91 98765 43216',
    status: 'approved',
    submittedDate: '2024-02-02',
    reviewedDate: '2024-02-03',
    cgpa: 8.3,
    avatar: 'RD'
  },
  {
    id: 'STU008',
    name: 'Ishita Gupta',
    rollNumber: 'M230493EE',
    program: 'M.Tech',
    department: 'Electrical Engineering',
    semester: 2,
    email: 'ishita.gupta@university.edu',
    phone: '+91 98765 43217',
    status: 'pending',
    submittedDate: '2024-02-08',
    cgpa: 8.9,
    avatar: 'IG'
  }
];

export const mockAcademicData = {
  STU001: {
    courses: [
      { code: 'CS601', name: 'Machine Learning', credits: 4, grade: 'A', marks: 85 },
      { code: 'CS602', name: 'Cloud Computing', credits: 3, grade: 'A-', marks: 82 },
      { code: 'CS603', name: 'Software Engineering', credits: 4, grade: 'B+', marks: 78 },
      { code: 'CS604', name: 'Data Mining', credits: 3, grade: 'A', marks: 88 }
    ],
    attendance: 92,
    publications: [],
    projects: [
      {
        title: 'AI-based Student Performance Predictor',
        guide: 'Dr. Kumar',
        status: 'Ongoing'
      }
    ]
  },
  STU002: {
    courses: [
      { code: 'EE501', name: 'Power Systems', credits: 4, grade: 'A+', marks: 95 },
      { code: 'EE502', name: 'Control Systems', credits: 3, grade: 'A', marks: 90 },
      { code: 'EE503', name: 'Digital Signal Processing', credits: 4, grade: 'A', marks: 92 }
    ],
    attendance: 96,
    publications: [
      {
        title: 'Optimization of Power Grid Using ML',
        journal: 'IEEE Transactions',
        year: 2024
      }
    ],
    projects: [
      {
        title: 'Smart Grid Management System',
        guide: 'Dr. Mehta',
        status: 'Completed'
      }
    ]
  }
};

export const mockCoCurricular = {
  STU001: [
    { activity: 'IEEE Student Chapter', role: 'Member', year: '2023-24' },
    { activity: 'Hackathon Winner', role: 'Participant', year: '2024', achievement: '1st Prize' },
    { activity: 'Coding Club', role: 'Coordinator', year: '2023-24' }
  ],
  STU002: [
    { activity: 'Research Paper Publication', role: 'Author', year: '2024' },
    { activity: 'Technical Symposium', role: 'Organizer', year: '2024' }
  ]
};