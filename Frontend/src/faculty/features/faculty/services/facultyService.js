import { mockStudents, mockAcademicData, mockCoCurricular } from '../data/mockData';

const API_BASE = "http://localhost:8080/api/faculty";
const STUDENT_API_BASE = "http://localhost:8080/api/student";

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

    const res = await fetch(`${API_BASE}/students?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch students");
    }
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapStudent) : [];
  },

async getStudentDetails(studentId) {
  // Fetch real student info from backend
  let backendStudent = null;
  try {
    const res = await fetch(`${STUDENT_API_BASE}/details/${encodeURIComponent(studentId)}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      backendStudent = await res.json();
      console.log('🔍 backendStudent from API:', backendStudent);
    } else {
      console.warn('⚠️ Student API returned:', res.status);
    }
  } catch (e) {
    console.error('❌ Failed to fetch student details from backend:', e);
  }

  // Fall back to mock only if backend returned nothing
  const mockStudent = mockStudents.find(
    s => s.id === studentId || s.rollNo === studentId
  );
  console.log('🔍 mockStudent fallback:', mockStudent);

  // Prefer backend data, fall back to mock, last resort is shell
  const rawStudent = backendStudent || mockStudent || { 
    id: studentId, 
    rollNo: studentId 
  };

  const baseStudent = mapStudent(rawStudent);
  console.log('🔍 baseStudent after mapStudent:', baseStudent);

  const rollNo = baseStudent.rollNumber || baseStudent.rollNo || studentId;

  const baseAcademic = (mockAcademicData[studentId]) || {
    courses: [],
    attendance: 0,
    publications: [],
    projects: []
  };

  let courses = [];
  let coCurricular = [];

  if (rollNo) {
    try {
      courses = await this.getStudentCourses(rollNo);
    } catch (e) {
      console.error('❌ Failed to fetch courses:', e);
    }

    try {
      coCurricular = await this.getStudentCoCurricular(rollNo);
    } catch (e) {
      console.error('❌ Failed to fetch co-curricular:', e);
    }
  }

  const result = {
    ...baseStudent,
    academicData: {
      ...baseAcademic,
      courses
    },
    coCurricular
  };

  console.log('🔍 final merged student:', result);
  return result;
},

  // Fetch course data for a student by roll number from backend
  async getStudentCourses(rollNo) {
    if (!rollNo) return [];

    const res = await fetch(`${STUDENT_API_BASE}/courses/${encodeURIComponent(rollNo)}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to fetch courses');
    }

    const data = await res.json();
    // Backend may return a string like "No data available for that roll no"
    if (typeof data === 'string' || !Array.isArray(data)) {
      return [];
    }

    return data.map((c) => ({
      code: c.courseCode,
      name: c.courseName,
      courseType: c.courseType,
      credits: c.credit,
      grade: c.grade,
      semester: c.semester,
    }));
  },

  // Fetch co-curricular activities for a student by roll number from backend
  async getStudentCoCurricular(rollNo) {
    if (!rollNo) return [];

    const res = await fetch(`${STUDENT_API_BASE}/cocurricular/${encodeURIComponent(rollNo)}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to fetch co-curricular activities');
    }

    const data = await res.json();
    // Backend may return a string like "No data available for that roll no"
    if (typeof data === 'string' || !Array.isArray(data)) {
      return [];
    }

    return data.map((a) => {
      const year = a.date ? String(a.date).split('-')[0] : '';
      return {
        activity: a.title,
        year,
        achievement: a.description,
        // Use backend "type" as a reasonable stand-in for role if present
        role: a.type || ''
      };
    });
  },

  // Get dashboard stats for the logged-in faculty advisor
  async getDashboardStats() {
    const user = safeGetUser();
    const params = new URLSearchParams();

    if (user?.email) params.append("email", user.email);

    const res = await fetch(`${API_BASE}/dashboard-stats?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch dashboard stats");
    }
    const raw = await res.json();

    // Normalize recentSubmissions so UI can rely on id, avatar, rollNumber, status, etc.
    const recentSubmissions = Array.isArray(raw.recentSubmissions)
      ? raw.recentSubmissions.map(mapStudent)
      : [];

    return {
      ...raw,
      recentSubmissions,
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