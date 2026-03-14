import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick, 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-indigo-600 hover:bg-indigo-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};