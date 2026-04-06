import React from 'react';
import { useTheme } from './ThemeContext';

/**
 * Drop-in dark mode toggle button.
 * Place it anywhere; it reads/writes the global ThemeContext.
 */
export default function DarkModeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative w-10 h-10 flex items-center justify-center rounded-xl
        transition-all duration-200 hover:scale-110 focus:outline-none
        ${isDark
          ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } ${className}`}
    >
      {isDark ? (
        /* Sun icon */
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m8.66-9H21M3 12H2m15.36-6.36l-.7.7M7.34 17.66l-.7.7m9.9 0l-.7-.7M7.34 6.34l-.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        /* Moon icon */
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      )}
    </button>
  );
}
