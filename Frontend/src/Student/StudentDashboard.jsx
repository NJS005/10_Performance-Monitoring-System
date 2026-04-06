import React, { useState, useEffect } from 'react';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { CourseGradesSection } from './CourseGradesSection';
import { CGPATrackerGraph } from './CGPATrackerGraph';
import { TargetCGPACalculator } from './TargetCGPACalculator';
import { AttendanceTracker } from './AttendanceTracker';
import { CoCurricularActivities } from './CoCurricularActivities';
import AcademicChatbot from './AcademicChatbot';
import { useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from '../DarkModeToggle';

const StudentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const savedUser = userString ? JSON.parse(userString) : {};
  const rollNo =
    location.state?.rollno ||
    location.state?.rollNo ||
    savedUser.rollno ||
    savedUser.rollNo ||
    '';

  const [activeView, setActiveView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [courseDetails, setCourseDetails] = useState({ core: [], elective: [] });

  // ── Fetch student data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!rollNo) return;
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/student/details/${rollNo}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setStudentData(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };
    fetchStudentData();
  }, [rollNo]);

  useEffect(() => {
    if (!studentData) return;
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/student/courses/${rollNo}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const strHash = (s) =>
          s.split('').reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0);
        const core = data
          .filter((c) => c.courseType === 'PC' || c.courseType === 'IC')
          .map((c) => ({
            id: Math.abs(strHash(c.courseCode + '-' + c.semester)),
            name: c.courseName,
            code: c.courseCode,
            grade: c.grade,
            credits: c.credit,
            semester: c.semester,
            category: c.courseType,
          }));
        const elective = data
          .filter((c) =>
            ['EI', 'OE', 'HM', 'DA', 'AC', 'PE'].includes(c.courseType)
          )
          .map((c) => ({
            id: Math.abs(strHash(c.courseCode + '-' + c.semester)),
            name: c.courseName,
            code: c.courseCode,
            grade: c.grade,
            credits: parseInt(c.credit),
            semester: c.semester,
            category: c.courseType,
          }));
        setCourseDetails({ core, elective });
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };
    fetchCourseDetails();
  }, [rollNo, studentData]);

  useEffect(() => {
    if (!studentData) return;
    const batchYear = parseInt(studentData.batch);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const academicYearsCompleted =
      month >= 7 ? year - batchYear : year - batchYear - 1;
    const isOddSemester = month >= 7 && month <= 11;
    const sem = academicYearsCompleted * 2 + (isOddSemester ? 1 : 2);
    setCurrentSemester(Math.max(1, sem));
  }, [studentData]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateStudentData = (patch) =>
    setStudentData((prev) => ({ ...prev, ...patch }));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const setCourses = (coursesOrUpdater) => {
    if (typeof coursesOrUpdater === 'function') {
      setCourseDetails((prev) => coursesOrUpdater(prev));
    } else {
      setCourseDetails(coursesOrUpdater);
    }
  };

  const getGradePoint = (grade) => {
    const gradeMap = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, R: 4, F: 0, W: 0, I: 0 };
    return gradeMap[grade] || 0;
  };

  const calculateGPAData = () => {
    const allCourses = [...courseDetails.core, ...courseDetails.elective];
    const semesterData = {};
    allCourses.forEach((course) => {
      if (!semesterData[course.semester])
        semesterData[course.semester] = { totalPoints: 0, totalCredits: 0 };
      const gp = getGradePoint(course.grade);
      semesterData[course.semester].totalPoints += gp * course.credits;
      semesterData[course.semester].totalCredits += course.credits;
    });
    let cumulativePoints = 0,
      cumulativeCredits = 0;
    const gpaData = [];
    Object.keys(semesterData)
      .sort((a, b) => a - b)
      .forEach((sem) => {
        const { totalPoints, totalCredits } = semesterData[sem];
        const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        cumulativePoints += totalPoints;
        cumulativeCredits += totalCredits;
        const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;
        gpaData.push({
          semester: parseInt(sem),
          sgpa: parseFloat(sgpa.toFixed(2)),
          cgpa: parseFloat(cgpa.toFixed(2)),
        });
      });
    return gpaData;
  };

  const calculateCurrentCGPA = () => {
    const allCourses = [...courseDetails.core, ...courseDetails.elective];
    let totalPoints = 0,
      totalCredits = 0;
    allCourses.forEach((c) => {
      totalPoints += getGradePoint(c.grade) * c.credits;
      totalCredits += c.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const gpaData = calculateGPAData();
  const currentCGPA = calculateCurrentCGPA();

  // ── Sidebar menu ───────────────────────────────────────────────────────────
  const menuItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'profile',
      name: 'Personal Details',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'grades',
      name: 'Course Grades',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'calculator',
      name: 'Target CGPA',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'cocurricular',
      name: 'Co-Curricular',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white text-lg font-semibold animate-pulse text-center">
            Loading Student Portal…
          </p>
        </div>
      </div>
    );
  }

  // ── Verification status helper ─────────────────────────────────────────────
  const verifLabel =
    studentData.verificationStatus === true
      ? 'Verified'
      : studentData.verificationStatus === false
      ? 'Pending'
      : String(studentData.verificationStatus ?? 'Pending');

  const verifColorClass =
    verifLabel.toLowerCase() === 'verified' || verifLabel.toLowerCase() === 'approved'
      ? 'text-green-400'
      : verifLabel.toLowerCase() === 'rejected'
      ? 'text-red-400'
      : 'text-yellow-400';

  // ── renderContent ──────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6">
            <PersonalDetailsSection
              studentData={studentData}
              setStudentData={updateStudentData}
              verificationStatus={studentData.verificationStatus}
              edit={false}
              showAll={false}
              currentSemester={currentSemester}
            />

            {/* Stats cards — 1 col on mobile, 3 on md+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* CGPA */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Current CGPA
                  </h3>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {currentCGPA}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                  Out of 10.00
                </p>
              </div>

              {/* Courses */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Total Courses
                  </h3>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {courseDetails.core.length + courseDetails.elective.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                  {courseDetails.core.length} Core, {courseDetails.elective.length} Elective
                </p>
              </div>

              {/* Verification — spans full width on sm (2-col) if there's an odd card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 sm:col-span-2 md:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Verification
                  </h3>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      verifLabel.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : verifLabel.toLowerCase() === 'verified' ||
                          verifLabel.toLowerCase() === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${verifColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {verifLabel}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                  Data verification status
                </p>
              </div>
            </div>

            {/* Overview bottom grid — stacked on mobile/tablet, side-by-side on lg+ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <CourseGradesSection
                courses={courseDetails}
                setCourses={setCourses}
                getGradePoint={getGradePoint}
                showSemester={currentSemester ? currentSemester - 1 : 'all'}
                rollNo={rollNo}
                readOnly={true}
                program={studentData?.program}
              />
              <CGPATrackerGraph gpaData={gpaData} currentCGPA={currentCGPA} />
            </div>
          </div>
        );

      case 'profile':
        return (
          <PersonalDetailsSection
            studentData={studentData}
            setStudentData={updateStudentData}
            verificationStatus={studentData.verificationStatus}
            edit={true}
            showAll={true}
            currentSemester={currentSemester}
            rollNo={rollNo}
          />
        );

      case 'grades':
        return (
          <CourseGradesSection
            courses={courseDetails}
            setCourses={setCourses}
            getGradePoint={getGradePoint}
            showSemester="all"
            rollNo={rollNo}
            program={studentData?.program}
          />
        );

      case 'calculator':
        return (
          <TargetCGPACalculator
            currentCGPA={parseFloat(currentCGPA)}
            courses={courseDetails}
            getGradePoint={getGradePoint}
          />
        );

      case 'cocurricular':
        return <CoCurricularActivities rollNo={rollNo} />;

      case 'attendance':
        return <AttendanceTracker courses={courseDetails} rollNo={rollNo} />;

      default:
        return null;
    }
  };

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex">

      {/* ─── DESKTOP Sidebar ─── */}
      <aside
        className={`
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          bg-white/10 dark:bg-black/20 backdrop-blur-md border-r border-white/20
          transition-all duration-300 flex-col
          hidden lg:flex sticky top-0 h-screen z-40 flex-shrink-0
        `}
      >
        {/* Logo / toggle row */}
<div className="p-4 xl:p-6 border-b border-white/20">
  {isSidebarOpen ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-bold text-lg">A</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-white text-xl font-bold truncate">AMS</h1>
          <p className="text-indigo-200 text-xs truncate">Student Portal</p>
        </div>
      </div>
      <button
        onClick={() => setIsSidebarOpen(false)}
        className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 min-w-[40px] min-h-[40px]"
        title="Collapse"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-indigo-600 font-bold text-lg">A</span>
      </div>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
        title="Expand"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )}
</div>

        {/* User profile strip */}
        {isSidebarOpen && (
          <div className="p-4 xl:p-6 border-b border-white/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {studentData.name?.charAt(0) ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{studentData.name}</p>
                <p className="text-indigo-200 text-sm truncate">{studentData.rollNo}</p>
                <p className="text-indigo-300 text-xs truncate">
                  {studentData.program} · {studentData.batch}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 p-3 xl:p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 xl:px-4 py-3 rounded-xl
                    transition-all duration-200 min-h-[44px]
                    ${activeView === item.id
                      ? 'bg-white text-indigo-700 shadow-lg'
                      : 'text-white hover:bg-white/10'}
                    ${!isSidebarOpen ? 'justify-center' : ''}
                  `}
                  title={!isSidebarOpen ? item.name : ''}
                >
                  {item.icon}
                  {isSidebarOpen && (
                    <span className="font-medium text-sm xl:text-base truncate">{item.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout / dark mode */}
        <div className="p-3 xl:p-4 border-t border-white/20 flex flex-col gap-2">
          {isSidebarOpen && <DarkModeToggle className="w-full rounded-xl" />}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 xl:px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px]"
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && <span className="font-medium text-sm xl:text-base">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE Sidebar (slide-in overlay) ─── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50 flex flex-col
          bg-indigo-950/95 backdrop-blur-md border-r border-white/20
          transition-transform duration-300 lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 sm:p-5 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-bold">A</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">AMS</h1>
              <p className="text-indigo-200 text-xs">Student Portal</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white hover:bg-white/10 p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-5 border-b border-white/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {studentData.name?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{studentData.name}</p>
              <p className="text-indigo-300 text-xs truncate">
                {studentData.rollNo} · {studentData.batch}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 min-h-[44px]
                    ${activeView === item.id
                      ? 'bg-white text-indigo-700 shadow-lg'
                      : 'text-white hover:bg-white/10'}`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/20 flex flex-col gap-2">
          <DarkModeToggle className="w-full rounded-xl" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px]"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 touch-none"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ─── Main content ─── */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto min-w-0">

        {/* Mobile top bar */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-white text-lg sm:text-xl font-bold truncate">AMS</h1>
          </div>
          <DarkModeToggle />
        </div>

        {/* Page header banner */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/20">
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 truncate">
              {menuItems.find((item) => item.id === activeView)?.name ?? 'Dashboard'}
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base">Track. Verify. Grow.</p>
          </div>
        </div>

        <div>{renderContent()}</div>
      </main>

      <AcademicChatbot
        courses={studentData.courses ?? courseDetails}
        studentData={studentData}
        currentCGPA={currentCGPA}
        getGradePoint={getGradePoint}
      />
    </div>
  );
};

export default StudentDashboard;