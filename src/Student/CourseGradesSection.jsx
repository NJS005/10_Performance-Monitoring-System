import React, { useState } from 'react';


export const CourseGradesSection = ({ courses, setCourses, getGradePoint, showSemester = 'all' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editCourses, setEditCourses] = useState(courses);
  const [uploadedPDF, setUploadedPDF] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [activeSemester, setActiveSemester] = useState(null);


  const getAllSemesters = () => {
    const allCourses = [...courses.core, ...courses.elective];
    const semesters = [...new Set(allCourses.map(course => course.semester))];
    return semesters.sort((a, b) => a - b);
  };

  const allSemesters = getAllSemesters();
  
 
  React.useEffect(() => {
    if (showSemester === 'all' && allSemesters.length > 0 && !activeSemester) {
      setActiveSemester(allSemesters[allSemesters.length - 1]); // Default to latest semester
    } else if (typeof showSemester === 'number') {
      setActiveSemester(showSemester);
    }
  }, [showSemester, allSemesters, activeSemester]);


  const filterCoursesBySemester = (coursesData, semester) => {
    if (showSemester === 'all' && semester) {
      return {
        core: coursesData.core.filter(course => course.semester === semester),
        elective: coursesData.elective.filter(course => course.semester === semester)
      };
    } else if (typeof showSemester === 'number') {
      return {
        core: coursesData.core.filter(course => course.semester === showSemester),
        elective: coursesData.elective.filter(course => course.semester === showSemester)
      };
    }
    return coursesData;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditCourses(JSON.parse(JSON.stringify(courses)));
  };

  const handleSave = () => {
    setCourses(editCourses);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditCourses(JSON.parse(JSON.stringify(courses)));
    setIsEditing(false);
  };


  const handleGradeChange = (category, courseId, newGrade) => {
    setEditCourses(prev => ({
      ...prev,
      [category]: prev[category].map(course => 
        course.id === courseId ? { ...course, grade: newGrade } : course
      )
    }));
  };

 
  const handlePDFUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedPDF(file);
      setPdfFileName(file.name);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

 
  const removePDF = () => {
    setUploadedPDF(null);
    setPdfFileName('');
  };

 
  const calculateStats = (categoryCourses) => {
    let totalCredits = 0;
    let totalPoints = 0;

    categoryCourses.forEach(course => {
      totalCredits += course.credits;
      totalPoints += getGradePoint(course.grade) * course.credits;
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    return { totalCredits, gpa };
  };

 
  const displayCourses = isEditing ? editCourses : courses;
  const filteredCourses = filterCoursesBySemester(displayCourses, activeSemester);
  
  const coreStats = calculateStats(filteredCourses.core);
  const electiveStats = calculateStats(filteredCourses.elective);

 
  const gradeOptions = ['S', 'A', 'B', 'C', 'D', 'E'];


  const gradeColors = {
    'S': 'bg-green-100 text-green-800 border-green-300',
    'A': 'bg-blue-100 text-blue-800 border-blue-300',
    'B': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'D': 'bg-orange-100 text-orange-800 border-orange-300',
    'E': 'bg-red-100 text-red-800 border-red-300',
  };

  const renderCourseList = (categoryName, categoryKey, categoryStats) => {
    const displayList = filteredCourses[categoryKey];

    if (displayList.length === 0) {
      return null; 
    }

    return (
      <div className="mb-6 last:mb-0">
   
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
          <h4 className="text-xl font-bold text-gray-900">{categoryName}</h4>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">
              <span className="font-semibold">{categoryStats.totalCredits}</span> Credits
            </span>
            <span className="text-indigo-700 font-bold">
              GPA: {categoryStats.gpa}
            </span>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-3">
          {displayList.map(course => (
            <div
              key={course.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Course Code */}
                <div className="col-span-2">
                  <span className="font-mono text-sm font-bold text-indigo-700">
                    {course.code}
                  </span>
                </div>

                {/* Course Name */}
                <div className="col-span-5">
                  <span className="font-medium text-gray-900">{course.name}</span>
                </div>

                {/* Credits */}
                <div className="col-span-2 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-semibold">
                    {course.credits} Credits
                  </span>
                </div>

                {/* Grade */}
                <div className="col-span-2 text-center">
                  {isEditing ? (
                    <select
                      value={course.grade}
                      onChange={(e) => handleGradeChange(categoryKey, course.id, e.target.value)}
                      className={`px-3 py-2 rounded-lg border-2 font-bold text-center cursor-pointer transition-all duration-200 ${gradeColors[course.grade]}`}
                    >
                      {gradeOptions.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 font-bold text-lg ${gradeColors[course.grade]}`}>
                      {course.grade}
                    </span>
                  )}
                </div>

                {/* Semester Info */}
                <div className="col-span-1 text-right">
                  <span className="text-xs text-gray-500">Sem {course.semester}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Course Grades</h3>
          <p className="text-gray-500">Academic performance overview</p>
        </div>
        
        {/* Edit Controls */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Semester Tabs - Show only when showSemester is 'all' */}
      {showSemester === 'all' && allSemesters.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {allSemesters.map(semester => (
              <button
                key={semester}
                onClick={() => setActiveSemester(semester)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200
                  ${activeSemester === semester
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }
                `}
              >
                Semester {semester}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Course Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredCourses.core.length === 0 && filteredCourses.elective.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">No courses for this semester</p>
              <p className="text-sm">Add course grades to see them here</p>
            </div>
          </div>
        ) : (
          <>
            {/* Core Courses */}
            {renderCourseList('Core Courses', 'core', coreStats)}

            {/* Elective Courses */}
            {renderCourseList('Elective Courses', 'elective', electiveStats)}
          </>
        )}
      </div>

      {/* Submit Button (FR-STU-05) */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
        {/* PDF Upload Section */}
        <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload {showSemester === 'all' && activeSemester ? `Semester ${activeSemester}` : 'Current Semester'} Grade Card (PDF)
            </label>
          </div>
          
          {!uploadedPDF ? (
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-indigo-700 font-medium">Click to upload PDF</span>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-300">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">{pdfFileName}</p>
                  <p className="text-xs text-gray-500">PDF uploaded successfully</p>
                </div>
              </div>
              <button
                onClick={removePDF}
                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Remove PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Upload your official grade card to supplement your course grades
          </p>
        </div>

        <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
          Submit for Verification
        </button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc;
        }
      `}</style>
    </div>
  );
};