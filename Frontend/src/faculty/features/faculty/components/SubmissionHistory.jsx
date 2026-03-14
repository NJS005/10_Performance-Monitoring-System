import React from 'react';
import { Card } from '../../../components/ui/Card';

const SubmissionHistory = ({ student }) => {
  const history = [
    {
      action: 'Submitted',
      date: student.submittedDate,
      description: 'Student submitted academic data for review',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'blue'
    }
  ];

  if (student.reviewedDate) {
    history.push({
      action: student.status === 'approved' ? 'Approved' : 'Rejected',
      date: student.reviewedDate,
      description: student.status === 'approved' 
        ? 'Submission approved by faculty advisor'
        : `Rejected: ${student.rejectionReason}`,
      icon: student.status === 'approved' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: student.status === 'approved' ? 'green' : 'red'
    });
  }

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600'
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Submission Timeline</h2>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((event, eventIdx) => (
            <li key={eventIdx}>
              <div className="relative pb-8">
                {eventIdx !== history.length - 1 && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${colorClasses[event.color]}`}>
                    {event.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-900">{event.action}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      <p>{event.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default SubmissionHistory;