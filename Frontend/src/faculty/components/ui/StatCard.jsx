import React from 'react';
import { Card } from './Card';

export const StatCard = ({ icon, label, value, subtext, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    rose: 'bg-rose-100 text-rose-600'
  };

  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center mb-4`}>
            {icon}
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {value}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">
            {label}
          </div>
          {subtext && (
            <div className="text-xs text-gray-500 mt-2">
              {subtext}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};