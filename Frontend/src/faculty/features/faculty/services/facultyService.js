import { mockStudents, mockAcademicData, mockCoCurricular } from '../data/mockData';

const API_BASE = "http://localhost:8080/api/faculty";

const safeGetUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// Simulate API delay for mock endpoints
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mapStudent = (student) => {
  const initials = (student?.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return {
    ...student,
    id: student.rollNo,
    rollNumber: student.rollNo,
    status: student.verificationStatus || student.status || 'pending',
    avatar: initials || 'FA',
    semester: student.batch || '',
    cgpa: student.cgpa || '-',
    submittedDate: student.submittedDate || new Date().toISOString(),
  };
};

export const facultyService = {
  // Get all students assigned to the logged-in faculty advisor
  async getStudents(filters = {}) {
    const user = safeGetUser();
    const params = new URLSearchParams();

    if (user?.email) params.append("email", user.email);
    if (filters.program) params.append("program", filters.program);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);

    const res = await fetch(`${API_BASE}/students?${params.toString()}`);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch students");
    }
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapStudent) : [];
  },

  // Get student details (mocked for now)
  async getStudentDetails(studentId) {
    await delay(300);
    
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');

    return {
      ...mapStudent(student),
      academicData: mockAcademicData[studentId] || { courses: [], attendance: 0, publications: [], projects: [] },
      coCurricular: mockCoCurricular[studentId] || []
    };
  },

  // Get dashboard stats for the logged-in faculty advisor
  async getDashboardStats() {
    const user = safeGetUser();
    const params = new URLSearchParams();

    if (user?.email) params.append("email", user.email);

    const res = await fetch(`${API_BASE}/dashboard-stats?${params.toString()}`);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch dashboard stats");
    }

    return res.json();
  },

  // Approve student
  async approveStudent(studentId) {
    await delay(600);
    
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');
    
    student.status = 'approved';
    student.reviewedDate = new Date().toISOString().split('T')[0];
    
    return { success: true, message: 'Student approved successfully' };
  },

  // Reject student
  async rejectStudent(studentId, remarks) {
    await delay(600);
    
    if (!remarks || remarks.trim().length === 0) {
      throw new Error('Rejection remarks are required');
    }
    
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');
    
    student.status = 'rejected';
    student.reviewedDate = new Date().toISOString().split('T')[0];
    student.rejectionReason = remarks;
    
    return { success: true, message: 'Student rejected with remarks' };
  }
};