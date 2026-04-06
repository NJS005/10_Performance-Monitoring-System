import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export const CGPATrackerGraph = ({ gpaData, currentCGPA }) => {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-2 border-indigo-200 dark:border-indigo-600">
          <p className="font-bold text-gray-900 dark:text-white mb-2">Semester {label}</p>
          <p className="text-indigo-700 dark:text-indigo-400 font-semibold">
            SGPA: {payload[0].value}
          </p>
          <p className="text-purple-700 dark:text-purple-400 font-semibold">
            CGPA: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate statistics
  const calculateStats = () => {
    if (gpaData.length === 0) return { avgSGPA: '0.00', highestSGPA: '0.00', lowestSGPA: '0.00' };
    
    const sgpaValues = gpaData.map(d => d.sgpa);
    const avgSGPA = (sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length).toFixed(2);
    const highestSGPA = Math.max(...sgpaValues).toFixed(2);
    const lowestSGPA = Math.min(...sgpaValues).toFixed(2);
    
    return { avgSGPA, highestSGPA, lowestSGPA };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">GPA Tracker</h3>
        <p className="text-gray-500 dark:text-gray-400">Semester-wise performance analysis</p>
      </div>

      {/* Current CGPA Display */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 shadow-lg">
        <div className="text-white text-center">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
            Current CGPA
          </p>
          <p className="text-5xl font-bold mb-1">{currentCGPA}</p>
          <div className="flex justify-center items-center gap-2 text-sm opacity-90">
            <span>out of 10.00</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/40 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-indigo-200 uppercase tracking-wide mb-1">
            Avg SGPA
          </p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{stats.avgSGPA}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/40 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-green-200 uppercase tracking-wide mb-1">
            Highest
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.highestSGPA}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/40 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-orange-200 uppercase tracking-wide mb-1">
            Lowest
          </p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.lowestSGPA}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[300px]">
        {gpaData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={gpaData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="semester"
                label={{ value: 'Semester', position: 'insideBottom', offset: -5 }}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `S${value}`}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                label={{ value: 'GPA', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="sgpa"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7 }}
                name="SGPA"
              />
              <Line
                type="monotone"
                dataKey="cgpa"
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: '#9333ea', r: 5 }}
                activeDot={{ r: 7 }}
                name="CGPA"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="font-medium">No GPA data available</p>
              <p className="text-sm">Add course grades to see your progress</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};