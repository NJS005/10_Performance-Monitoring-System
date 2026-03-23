import React from 'react';
import { Card } from '../../../components/ui/Card';

const getCurrentSemester = (batchYear, fallbackSemester) => {
  if (!batchYear) return fallbackSemester;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1–12

  const academicYearsCompleted =
    month >= 7
      ? year - batchYear
      : year - batchYear - 1;

  const isOddSemester = month >= 7 && month <= 11;

  const sem = academicYearsCompleted * 2 + (isOddSemester ? 1 : 2);

  return sem > 0 ? sem : fallbackSemester;
};

const StudentCard = ({ student }) => {
  const batchYear = student.batchYear ?? student.batch;
  const currentSemester = getCurrentSemester(batchYear, student.semester);

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
              <div className="font-medium text-slate-900">Semester {currentSemester}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;