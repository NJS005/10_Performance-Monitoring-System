import React from 'react';

export const Badge = ({ status, children }) => {
  const statusStyles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
      border ${statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}
    `}>
      {children}
    </span>
  );
};