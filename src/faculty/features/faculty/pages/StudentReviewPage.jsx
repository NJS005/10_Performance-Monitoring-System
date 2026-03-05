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

const StudentReviewPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);

  const { data: student, isLoading } = useStudentDetails(studentId);
  const { approveStudent, rejectStudent } = useReviewActions();

  const handleApprove = async () => {
    try {
      await approveStudent.mutateAsync(studentId);
      navigate('/faculty/students');
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (remarks) => {
    try {
      await rejectStudent.mutateAsync({ studentId, remarks });
      setShowRejectModal(false);
      navigate('/faculty/students');
    } catch (error) {
      console.error('Rejection failed:', error);
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
        <p className="text-gray-500">Student not found</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Review Submission</h1>
            <p className="mt-1 text-sm text-gray-500">Academic performance verification</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance</h2>
        
        

        {/* Courses */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Course Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Course Code</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Course Name</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">Credits</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">Marks</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {student.academicData.courses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{course.code}</td>
                    <td className="px-4 py-3 text-gray-700">{course.name}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{course.credits}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">{course.marks}</td>
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

        {/* Projects */}
        {student.academicData.projects && student.academicData.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Projects</h3>
            <div className="space-y-3">
              {student.academicData.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">Guide: {project.guide}</p>
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Publications</h3>
            <div className="space-y-3">
              {student.academicData.publications.map((pub, index) => (
                <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{pub.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {pub.journal} • {pub.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Co-Curricular Activities */}
      {student.coCurricular && student.coCurricular.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Co-Curricular Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.coCurricular.map((activity, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{activity.activity}</h4>
                <p className="text-sm text-gray-600 mt-1">Role: {activity.role}</p>
                <p className="text-sm text-gray-500 mt-1">Year: {activity.year}</p>
                {activity.achievement && (
                  <p className="text-sm text-emerald-600 font-medium mt-1">{activity.achievement}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

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
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={() => setShowApprovalConfirm(false)} />
            <Card className="relative max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Approval</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to approve this submission? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowApprovalConfirm(false)}
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