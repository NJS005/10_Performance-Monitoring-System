import React from 'react';
import { Card } from '../../../components/ui/Card';

const StudentCard = ({ student }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
          {student.avatar}
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
              <p className="text-slate-600 mt-1">{student.rollNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">CGPA</div>
              <div className="text-2xl font-bold text-indigo-600">{student.cgpa}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <div className="text-sm text-slate-500">Program</div>
              <div className="font-medium text-slate-900">{student.program}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Department</div>
              <div className="font-medium text-slate-900">{student.department}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Semester</div>
              <div className="font-medium text-slate-900">Semester {student.semester}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Email</div>
              <div className="font-medium text-slate-900 text-sm truncate">{student.email}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;