import React, { useState } from 'react';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { CourseGradesSection } from './CourseGradesSection';
import { CGPATrackerGraph } from './CGPATrackerGraph';
import { TargetCGPACalculator } from './TargetCGPACalculator';
import { AttendanceTracker } from './AttendanceTracker';
import { CoCurricularActivities } from './CoCurricularActivities';
import AcademicChatbot from './AcademicChatbot';

/**
 * Main Student Dashboard Component with Navigation + AI Chatbot
 * 
 * This dashboard implements the full student interface for the Performance Monitoring System
 * Following requirements: FR-STU-01 through FR-STU-07, FR-BOT-01, FR-BOT-02
 * 
 * Features:
 * - Left sidebar navigation
 * - Conditional rendering based on selected menu item
 * - Mobile-responsive with collapsible sidebar
 * - AI Academic Advisor Chatbot (bottom-right floating)
 */
const StudentDashboard = () => {
  // Navigation state
  const [activeView, setActiveView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Student Personal Data (FR-STU-01)
  const [studentData, setStudentData] = useState({
    name: 'Pankaj Kumar R',
    rollNumber: 'B230483CS',
    department: 'Computer Science',
    program: 'B.Tech',
    batch: '2023',
    currentSemester: 5
  });

  // Academic Grades Data (FR-STU-02, FR-STU-03)
  const [courses, setCourses] = useState({
    core: [
      { id: 1, code: 'CS301', name: 'Data Structures', credits: 4, grade: 'A', semester: 3 },
      { id: 2, code: 'CS302', name: 'Algorithms', credits: 4, grade: 'S', semester: 3 },
      { id: 3, code: 'CS303', name: 'Database Systems', credits: 3, grade: 'A', semester: 4 },
      { id: 4, code: 'CS304', name: 'Operating Systems', credits: 4, grade: 'B', semester: 4 },
      { id: 5, code: 'CS305', name: 'Computer Networks', credits: 3, grade: 'A', semester: 5 },
    ],
    elective: [
      { id: 6, code: 'CS401', name: 'Machine Learning', credits: 3, grade: 'S', semester: 5 },
      { id: 7, code: 'CS402', name: 'Cloud Computing', credits: 3, grade: 'A', semester: 5 },
    ]
  });

  // Verification status (FR-STU-06)
  const [verificationStatus, setVerificationStatus] = useState('pending');

  // Co-curricular activities (FR-STU-04)
  const [activities, setActivities] = useState('');

  // Calculate GPA data for the graph
  const calculateGPAData = () => {
    const allCourses = [...courses.core, ...courses.elective];
    const semesterData = {};

    allCourses.forEach(course => {
      if (!semesterData[course.semester]) {
        semesterData[course.semester] = { totalPoints: 0, totalCredits: 0 };
      }
      const gradePoint = getGradePoint(course.grade);
      semesterData[course.semester].totalPoints += gradePoint * course.credits;
      semesterData[course.semester].totalCredits += course.credits;
    });

    let cumulativePoints = 0;
    let cumulativeCredits = 0;
    const gpaData = [];

    Object.keys(semesterData).sort((a, b) => a - b).forEach(sem => {
      const semData = semesterData[sem];
      const sgpa = semData.totalCredits > 0 ? semData.totalPoints / semData.totalCredits : 0;
      
      cumulativePoints += semData.totalPoints;
      cumulativeCredits += semData.totalCredits;
      const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

      gpaData.push({
        semester: parseInt(sem),
        sgpa: parseFloat(sgpa.toFixed(2)),
        cgpa: parseFloat(cgpa.toFixed(2))
      });
    });

    return gpaData;
  };

  // Grade to grade point conversion (S=10, A=9, B=8, C=7, D=6, E=5)
  const getGradePoint = (grade) => {
    const gradeMap = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5 };
    return gradeMap[grade] || 0;
  };

  // Calculate current CGPA
  const calculateCurrentCGPA = () => {
    const allCourses = [...courses.core, ...courses.elective];
    let totalPoints = 0;
    let totalCredits = 0;

    allCourses.forEach(course => {
      totalPoints += getGradePoint(course.grade) * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const gpaData = calculateGPAData();
  const currentCGPA = calculateCurrentCGPA();

  // Navigation menu items
  const menuItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'profile',
      name: 'Personal Details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'grades',
      name: 'Course Grades',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'calculator',
      name: 'Target CGPA',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'cocurricular',
      name: 'Co-Curricular',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Current CGPA</h3>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-indigo-600">{currentCGPA}</p>
                <p className="text-sm text-gray-500 mt-2">Out of 10.00</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Total Courses</h3>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-purple-600">{courses.core.length + courses.elective.length}</p>
                <p className="text-sm text-gray-500 mt-2">{courses.core.length} Core, {courses.elective.length} Elective</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Verification</h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    verificationStatus === 'pending' ? 'bg-yellow-100' :
                    verificationStatus === 'approved' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      verificationStatus === 'pending' ? 'text-yellow-600' :
                      verificationStatus === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{verificationStatus}</p>
                <p className="text-sm text-gray-500 mt-2">Data verification status</p>
              </div>
            </div>

            {/* Academic Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CourseGradesSection 
                courses={courses}
                setCourses={setCourses}
                getGradePoint={getGradePoint}
                showSemester={5}
              />
              <CGPATrackerGraph 
                gpaData={gpaData}
                currentCGPA={currentCGPA}
              />
            </div>
          </div>
        );

      case 'profile':
        return (
          <PersonalDetailsSection 
            studentData={studentData}
            setStudentData={setStudentData}
            verificationStatus={verificationStatus}
          />
        );

      case 'grades':
        return (
          <CourseGradesSection 
            courses={courses}
            setCourses={setCourses}
            getGradePoint={getGradePoint}
            showSemester={'all'}
          />
        );


      case 'calculator':
        return (
          <TargetCGPACalculator 
            currentCGPA={parseFloat(currentCGPA)}
            courses={courses}
            getGradePoint={getGradePoint}
          />
        );

      case 'cocurricular':
        return <CoCurricularActivities />;

      case 'attendance':
        return (
          <AttendanceTracker 
            courses={courses}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex">
      {/* Sidebar Navigation */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        bg-white/10 backdrop-blur-md border-r border-white/20 
        transition-all duration-300 flex flex-col
        fixed lg:sticky top-0 h-screen z-40
      `}>
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                {/* //logo here */}
                <span className="text-indigo-600 font-bold text-lg">A</span>
              </div>
              {isSidebarOpen && (
                <div>
                  <h1 className="text-white text-xl font-bold">AMS</h1>
                  <p className="text-indigo-200 text-xs">Student Portal</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors lg:block hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : ""} />
              </svg>
            </button>
          </div>
        </div>

        {/* User Info */}
        {isSidebarOpen && (
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {studentData.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{studentData.name}</p>
                <p className="text-indigo-200 text-sm truncate">{studentData.rollNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${activeView === item.id
                      ? 'bg-white text-indigo-700 shadow-lg'
                      : 'text-white hover:bg-white/10'
                    }
                    ${!isSidebarOpen && 'justify-center'}
                  `}
                  title={!isSidebarOpen ? item.name : ''}
                >
                  {item.icon}
                  {isSidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-white/20">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white bg-white/10 p-2 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl"></div>
            <h1 className="text-white text-xl font-bold">AMS</h1>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-white text-3xl font-bold mb-2">
              {menuItems.find(item => item.id === activeView)?.name || 'Dashboard'}
            </h2>
            <p className="text-indigo-200">Track. Verify. Grow.</p>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      {/* AI Academic Chatbot - Floating in bottom-right */}
      <AcademicChatbot 
        courses={courses}
        studentData={studentData}
        currentCGPA={currentCGPA}
        getGradePoint={getGradePoint}
      />
    </div>
  );
};

export default StudentDashboard;