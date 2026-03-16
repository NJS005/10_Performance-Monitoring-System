import React, { useState, useEffect } from 'react';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { CourseGradesSection } from './CourseGradesSection';
import { CGPATrackerGraph } from './CGPATrackerGraph';
import { TargetCGPACalculator } from './TargetCGPACalculator';
import { AttendanceTracker } from './AttendanceTracker';
import { CoCurricularActivities } from './CoCurricularActivities';
import AcademicChatbot from './AcademicChatbot';
import { useLocation } from "react-router-dom";

const StudentDashboard = () => {
  const location = useLocation();


    const userString = localStorage.getItem("user");
    const savedUser = userString ? JSON.parse(userString) : {};
    const rollNo = location.state?.rollno 
                || location.state?.rollNo 
                || savedUser.rollno 
                || savedUser.rollNo 
                || '';

    console.log("Extracted Roll Number:", rollNo);

  const [activeView, setActiveView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [studentData, setStudentData] = useState(null);   // ← null, not undefined
  const [currentSemester, setCurrentSemester] = useState(null);


  

  const [courseDetails, setCourseDetails] = useState({
    core: [],
    elective: [],
  });

 

  // ── Fetch student data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!rollNo) return;
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/student/details/${rollNo}`);
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
    if(!studentData) return;
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/student/courses/${rollNo}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log("Fetched course details:", data);
        const core = data.filter(c => c.courseType === 'PC' || c.courseType === 'IC').map(c => ({
          name: c.courseName,
          code:c.courseCode,
          grade: c.grade,
          credits: c.credit,
          semester: c.semester,
          category: c.courseType,
        }));
        const elective = data.filter(c => c.courseType === 'EI' || c.courseType === 'OE'|| c.courseType === 'HM'|| c.courseType === 'DA'|| c.courseType === 'AC'|| c.courseType === 'PE').map(c => ({
          name: c.courseName,
          code: c.courseCode,
          grade: c.grade,
          credits: parseInt(c.credit),
          semester: c.semester,
          category: c.courseType,
        }));
        
        setCourseDetails({ core: core, elective: elective });
       
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };
    fetchCourseDetails();
  }, [rollNo, studentData]);

// Add this right below your other useEffects
  useEffect(() => {
    // console.log("THE REAL STATE IS NOW:", courseDetails);
  }, [courseDetails]); // This tells React: "Run this log EVERY time courseDetails officially changes!"

  // ── C
  // ompute current semester once studentData is ready ────────────────────
 useEffect(() => {
  if (!studentData) return;

  const batchYear = parseInt(studentData.batch);
  const now       = new Date();
  const year      = now.getFullYear();
  const month     = now.getMonth() + 1; // 1–12

    const academicYearsCompleted = month >= 7
    ? year - batchYear          // Jul–Dec: in the (year - batchYear + 1)th year
    : year - batchYear - 1;     // Jan–Jun: still in previous academic year

  
  const isOddSemester = month >= 7 && month <= 11;

  const sem = academicYearsCompleted * 2 + (isOddSemester ? 1 : 2);

  setCurrentSemester(Math.max(1, sem)); // clamp to at least 1
}, [studentData]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateStudentData = (patch) =>
    setStudentData((prev) => ({ ...prev, ...patch }));

 const setCourses = (coursesOrUpdater) => {
  if (typeof coursesOrUpdater === 'function') {
    setCourseDetails(prev => coursesOrUpdater(prev)); // ← passes full { core, elective }
  } else {
    setCourseDetails(coursesOrUpdater); // ← direct replacement
  }
};

  const getGradePoint = (grade) => {
    const gradeMap = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5 };
    return gradeMap[grade] || 0;
  };

  const calculateGPAData = () => {
    const allCourses = [...courseDetails.core, ...courseDetails.elective];
    const semesterData = {};
    allCourses.forEach((course) => {
      if (!semesterData[course.semester])
        semesterData[course.semester] = { totalPoints: 0, totalCredits: 0 };
      const gp = getGradePoint(course.grade);
      semesterData[course.semester].totalPoints  += gp * course.credits;
      semesterData[course.semester].totalCredits += course.credits;
    });

    let cumulativePoints = 0, cumulativeCredits = 0;
    const gpaData = [];
    Object.keys(semesterData).sort((a, b) => a - b).forEach((sem) => {
      const { totalPoints, totalCredits } = semesterData[sem];
      const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      cumulativePoints  += totalPoints;
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
    let totalPoints = 0, totalCredits = 0;
    allCourses.forEach((c) => {
      totalPoints  += getGradePoint(c.grade) * c.credits;
      totalCredits += c.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const gpaData     = calculateGPAData();
  const currentCGPA = calculateCurrentCGPA();

  // ── Sidebar menu ───────────────────────────────────────────────────────────
  const menuItems = [
    {
      id: 'overview', name: 'Overview',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
    },
    {
      id: 'profile', name: 'Personal Details',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
    },
    {
      id: 'grades', name: 'Course Grades',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    },
    {
      id: 'calculator', name: 'Target CGPA',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>),
    },
    {
      id: 'cocurricular', name: 'Co-Curricular',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>),
    },
    {
      id: 'attendance', name: 'Attendance',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
    },
  ];

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white text-lg font-semibold animate-pulse">Loading Student Portal…</p>
        </div>
      </div>
    );
  }

  // ── Verification status helper ─────────────────────────────────────────────
  const verifLabel =
    studentData.verificationStatus === true  ? 'Verified'  :
    studentData.verificationStatus === false ? 'Pending'   :
    String(studentData.verificationStatus ?? 'Pending');

  const verifColorClass =
    verifLabel === 'Verified' || verifLabel === 'approved' ? 'text-green-400' :
    verifLabel === 'rejected'                              ? 'text-red-400'   :
                                                             'text-yellow-400';

  // ── renderContent ──────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeView) {

      case 'overview':
        return (
          <div className="space-y-6">
            <PersonalDetailsSection
              studentData={studentData}
              setStudentData={updateStudentData}
              verificationStatus={studentData.personalVerificationStatus}
              edit={false}
              showAll={false}
              currentSemester={currentSemester}
            />

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CGPA */}
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

              {/* Courses */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Total Courses</h3>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-purple-600">
                  {courseDetails.core.length + courseDetails.elective.length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {courseDetails.core.length} Core, {courseDetails.elective.length} Elective
                </p>
              </div>

              {/* Verification */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Verification</h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    verifLabel === 'Pending'  ? 'bg-yellow-100' :
                    verifLabel === 'Verified' || verifLabel === 'approved' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-6 h-6 ${verifColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{verifLabel}</p>
                <p className="text-sm text-gray-500 mt-2">Data verification status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CourseGradesSection
                courses={courseDetails}
                setCourses={setCourses}
                getGradePoint={getGradePoint}
                showSemester={currentSemester ? currentSemester - 1 : 'all'}
                rollNo = {rollNo}
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
            verificationStatus={studentData.personalVerificationStatus}
            edit={true}
            showAll={true}
            currentSemester={currentSemester}
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
        return <AttendanceTracker courses={courseDetails} />;

      default:
        return null;
    }
  };

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex">

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        bg-white/10 backdrop-blur-md border-r border-white/20
        transition-all duration-300 flex flex-col
        fixed lg:sticky top-0 h-screen z-40
      `}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center cursor-pointer"
                onClick={() => setIsSidebarOpen(true)}
              >
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
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors hidden lg:block"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isSidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </button>
          </div>
        </div>

        {isSidebarOpen && (
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {studentData.name?.charAt(0) ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{studentData.name}</p>
                <p className="text-indigo-200 text-sm truncate">{studentData.rollNo}</p>
                <p className="text-indigo-300 text-xs">{studentData.program} · {studentData.batch}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${activeView === item.id ? 'bg-white text-indigo-700 shadow-lg' : 'text-white hover:bg-white/10'}
                    ${!isSidebarOpen ? 'justify-center' : ''}
                  `}
                  title={!isSidebarOpen ? item.name : ''}
                >
                  {item.icon}
                  {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

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

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="lg:hidden mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl" />
          <h1 className="text-white text-xl font-bold">AMS</h1>
        </div>

        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-white text-3xl font-bold mb-2">
              {menuItems.find((item) => item.id === activeView)?.name ?? 'Dashboard'}
            </h2>
            <p className="text-indigo-200">Track. Verify. Grow.</p>
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