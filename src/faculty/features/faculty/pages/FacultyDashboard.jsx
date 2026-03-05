import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useDashboardStats } from '../hooks/useStudents';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good afternoon, Dr. Faculty Advisor</h1>
        <p className="text-indigo-100">
          You have <span className="font-semibold">{stats?.pending || 0} pending reviews</span>
          {stats?.pending > 5 && <span className="ml-2">• <span className="text-amber-300">3 urgent</span></span>}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Pending Reviews"
          value={stats?.pending || 0}
          subtext={`+${Math.min(3, stats?.pending || 0)} today`}
          color="amber"
        />
        
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Approved"
          value={stats?.approved || 0}
          subtext="This month"
          color="emerald"
        />
        
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
          label="Rejected"
          value={stats?.rejected || 0}
          subtext="Needs resubmission"
          color="rose"
        />
        
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          label="Total Students"
          value={stats?.total || 0}
          subtext="Under supervision"
          color="indigo"
        />
      </div>

      {/* Priority Alerts */}
      {stats?.pending > 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-amber-800">Requires Immediate Attention</h3>
              <div className="mt-2 text-sm text-amber-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Aarav Sharma (B.Tech) — Overdue 3 days</li>
                  <li>Priya Nair (PhD) — Resubmission pending</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/faculty/students')}
          >
            View All →
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentSubmissions?.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
                        {student.avatar}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.program}</div>
                    <div className="text-sm text-gray-500">{student.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={student.status}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(student.submittedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {student.status === 'pending' ? (
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => navigate(`/faculty/review/${student.id}`)}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate(`/faculty/review/${student.id}`)}
                      >
                        View Details
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FacultyDashboard;