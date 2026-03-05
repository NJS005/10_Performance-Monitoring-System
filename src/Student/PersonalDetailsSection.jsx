import React, { useState } from 'react';



export const PersonalDetailsSection = ({ studentData, setStudentData, verificationStatus ,edit ,showAll }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(studentData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(studentData);
  };

  const handleSave = () => {
    setStudentData({ ...editData, personalVerificationStatus: 'pending' });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(studentData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  // Status badge colors
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    verified: 'bg-green-500/20 text-green-500 border-green-500/30',
    approved: 'bg-green-500/20 text-green-500 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-500 border-red-500/30'
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Personal Details</h3>
          <p className="text-gray-500">View {!edit ? '' : 'and manage'} your profile information</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Verification Status Badge (FR-STU-06) */}
          <span className={`px-4 py-2 rounded-lg border font-medium text-sm ${statusColors[verificationStatus]}`}>
            {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
          </span>
          
          {/* Edit/Save Buttons */}
          {!isEditing ? (
            edit && <button
              onClick={handleEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
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
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Student Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Student Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            />
          ) : (
            <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
              {studentData.name}
            </p>
          )}
        </div>

        {/* Roll Number */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Roll Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.rollNumber}
              onChange={(e) => handleChange('rollNumber', e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            />
          ) : (
            <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
              {studentData.rollNumber}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Department
          </label>
          {isEditing ? (
            <select
              value={editData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            >
              <option>Computer Science</option>
              <option>Electronics</option>
              <option>Mechanical</option>
              <option>Civil</option>
              <option>Electrical</option>
            </select>
          ) : (
            <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
              {studentData.department}
            </p>
          )}
        </div>

        {/* Program */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Program
          </label>
          {isEditing ? (
            <select
              value={editData.program}
              onChange={(e) => handleChange('program', e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            >
              <option>B.Tech</option>
              <option>M.Tech</option>
              <option>MCA</option>
              <option>PhD</option>
            </select>
          ) : (
            <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
              {studentData.program}
            </p>
          )}
        </div>

        {/* Batch/Year */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Batch / Year
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.batch}
              onChange={(e) => handleChange('batch', e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            />
          ) : (
            <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
              {studentData.batch}
            </p>
          )}
        </div>

        {/* Current Semester */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Current Semester
          </label>
          {isEditing ? (
            <select
              value={editData.currentSemester}
              onChange={(e) => handleChange('currentSemester', parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          ) : (
            <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
              Semester {studentData.currentSemester}
            </p>
          )}
        </div>
      </div>
      {showAll ? (
        <div>
          <button className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
            Show All Details
          </button>
        </div>
      ):null}
    </div>
  );
};