import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useStudentDetails } from '../hooks/useStudents';
import { useReviewActions } from '../hooks/useReviewActions';
import StudentCard from '../components/StudentCard';
import RejectModal from '../components/RejectModal';
import ApprovalActions from '../components/ApprovalActions';
import SubmissionHistory from '../components/SubmissionHistory';

const calculateCgpaFromCourses = (courses) => {
  if (!courses || courses.length === 0) return null;

  const gradeToPoint = (grade) => {
    if (typeof grade === 'number') return grade;

    const map = {
      // Official scale
      'S': 10,
      'A': 9,
      'B': 8,
      'C': 7,
      'D': 6,
      'E': 5,
      'F': 0,
      // Fallbacks for any existing data using plus/minus or other codes
      'O': 10,
      'A+': 10,
      'A-': 8,
      'B+': 8,
      'P': 5
    };

    return map[grade] ?? null;
  };

  let totalCredits = 0;
  let totalPoints = 0;

  courses.forEach((course) => {
    const gradePoint = gradeToPoint(course.grade ?? course.gradePoint);
    const credits = Number(course.credits) || 0;

    if (gradePoint !== null && credits > 0) {
      totalCredits += credits;
      totalPoints += gradePoint * credits;
    }
  });

  if (totalCredits === 0) return null;

  return (totalPoints / totalCredits).toFixed(2);
};

const StudentReviewPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const { data: student, isLoading } = useStudentDetails(studentId);
  const { approveStudent, rejectStudent } = useReviewActions();

  const computedCgpa = calculateCgpaFromCourses(student?.academicData?.courses);

  const handleViewCoursePdf = async (semester) => {
    if (!student?.rollNumber) {
      alert('Student roll number not available');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/student/courses/verification/${encodeURIComponent(student.rollNumber)}?semester=${semester}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!res.ok) {
        alert('No verification PDF uploaded for this semester yet.');
        return;
      }

      const data = await res.json();
      if (!data.document) {
        alert('No verification document found for this semester.');
        return;
      }

      window.open(`http://localhost:8080/${data.document}`, '_blank');
    } catch (error) {
      console.error('Failed to open course verification PDF:', error);
      alert('Failed to open verification PDF. Please try again.');
    }
  };

  const handleViewCertificate = (certificatePath) => {
    if (!certificatePath || typeof certificatePath !== 'string') {
      alert('No certificate uploaded for this activity.');
      return;
    }
    window.open(`http://localhost:8080/${certificatePath}`, '_blank');
  };

  const handleApprove = async () => {
    try {
      await approveStudent.mutateAsync({ studentId, remarks: approvalRemarks });
      setApprovalRemarks('');
      alert('Student approved successfully!');
      navigate('/faculty/students');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve student. Please try again.');
    }
  };

  const handleReject = async (remarks) => {
    try {
      await rejectStudent.mutateAsync({ studentId, remarks });
      setShowRejectModal(false);
      alert('Student rejected successfully!');
      navigate('/faculty/students');
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Failed to reject student. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Student not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/faculty/students')}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Review Submission</h1>
            <p className="mt-1 text-sm text-slate-500">Academic performance verification</p>
          </div>
        </div>
        <Badge status={student.status}>
          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
        </Badge>
      </div>

      {/* Student Summary Card */}
      <StudentCard student={student} />

      {/* Academic Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Academic Performance</h2>
          {computedCgpa && (
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CGPA</p>
              <p className="text-2xl font-bold text-indigo-600">{computedCgpa}</p>
            </div>
          )}
        </div>

        {/* Courses */}
       {/* Courses - grouped by semester */}
<div className="mb-6">
  <h3 className="text-sm font-semibold text-slate-900 mb-3">Course Performance</h3>
  {student.academicData?.courses?.length > 0 ? (
    (() => {
      // Group courses by semester
      const bySemester = student.academicData.courses.reduce((acc, course) => {
        const sem = course.semester || 'N/A';
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(course);
        return acc;
      }, {});

      return Object.keys(bySemester)
        .sort((a, b) => a - b)
        .map(sem => (
          <div key={sem} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-indigo-600 uppercase">
                Semester {sem}
              </p>
              {sem !== 'N/A' && !Number.isNaN(Number(sem)) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewCoursePdf(sem)}
                >
                  View PDF
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Course Code</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Course Name</th>
                    <th className="px-4 py-2 text-center font-medium text-slate-700">Type</th>
                    <th className="px-4 py-2 text-center font-medium text-slate-700">Credits</th>
                    <th className="px-4 py-2 text-center font-medium text-slate-700">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bySemester[sem].map((course, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{course.code}</td>
                      <td className="px-4 py-3 text-slate-700">{course.name}</td>
                      <td className="px-4 py-3 text-center text-slate-500 text-xs">{course.courseType || '—'}</td>
                      <td className="px-4 py-3 text-center text-slate-700">{course.credits}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {course.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ));
    })()
  ) : (
    <p className="text-sm text-slate-500">No course data available for this student</p>
  )}
</div>

        {/* Projects */}
        {student.academicData.projects && student.academicData.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Projects</h3>
            <div className="space-y-3">
              {student.academicData.projects.map((project, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">{project.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">Guide: {project.guide}</p>
                    </div>
                    <Badge status={project.status === 'Completed' ? 'approved' : 'pending'}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications */}
        {student.academicData.publications && student.academicData.publications.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Publications</h3>
            <div className="space-y-3">
              {student.academicData.publications.map((pub, index) => (
                <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900">{pub.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {pub.journal} • {pub.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Co-Curricular Activities */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Co-Curricular Activities</h2>
        {student.coCurricular && student.coCurricular.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.coCurricular.map((activity, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">{activity.activity}</h4>
                    <p className="text-sm text-slate-600 mt-1">Role: {activity.role}</p>
                    <p className="text-sm text-slate-500 mt-1">Year: {activity.year}</p>
                    {activity.achievement && (
                      <p className="text-sm text-emerald-600 font-medium mt-1">{activity.achievement}</p>
                    )}
                  </div>
                  {activity.certificatePath && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewCertificate(activity.certificatePath)}
                    >
                      View PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No data available for that roll no</p>
        )}
      </Card>

      {/* Submission History */}
      <SubmissionHistory student={student} />

      {/* Approval Actions */}
      {student.status === 'pending' && (
        <ApprovalActions
          onApprove={() => setShowApprovalConfirm(true)}
          onReject={() => setShowRejectModal(true)}
          isLoading={approveStudent.isPending || rejectStudent.isPending}
        />
      )}

      {/* Approval Confirmation Modal */}
      {showApprovalConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50" onClick={() => setShowApprovalConfirm(false)} />
            <Card className="relative max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Approval</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to approve this submission? This action cannot be undone.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Approval Remarks <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <textarea
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  rows={4}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Add any remarks or notes for the student (optional)..."
                />
              </div>
              <div className="flex space-x-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowApprovalConfirm(false);
                    setApprovalRemarks('');
                  }}
                  disabled={approveStudent.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={approveStudent.isPending}
                >
                  {approveStudent.isPending ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
        isLoading={rejectStudent.isPending}
      />
    </div>
  );
};

export default StudentReviewPage;