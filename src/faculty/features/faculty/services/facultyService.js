import { mockStudents, mockAcademicData, mockCoCurricular } from '../data/mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const facultyService = {
  // Get all students
  async getStudents(filters = {}) {
    await delay(500);
    
    let students = [...mockStudents];
    
    // Apply filters
    if (filters.program) {
      students = students.filter(s => s.program === filters.program);
    }
    
    if (filters.status) {
      students = students.filter(s => s.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.rollNumber.toLowerCase().includes(searchLower)
      );
    }
    
    return students;
  },

  // Get student details
  async getStudentDetails(studentId) {
    await delay(300);
    
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');
    
    return {
      ...student,
      academicData: mockAcademicData[studentId] || { courses: [], attendance: 0, publications: [], projects: [] },
      coCurricular: mockCoCurricular[studentId] || []
    };
  },

  // Get dashboard stats
  async getDashboardStats() {
    await delay(400);
    
    const total = mockStudents.length;
    const pending = mockStudents.filter(s => s.status === 'pending').length;
    const approved = mockStudents.filter(s => s.status === 'approved').length;
    const rejected = mockStudents.filter(s => s.status === 'rejected').length;
    
    return {
      total,
      pending,
      approved,
      rejected,
      recentSubmissions: mockStudents
        .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
        .slice(0, 5)
    };
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