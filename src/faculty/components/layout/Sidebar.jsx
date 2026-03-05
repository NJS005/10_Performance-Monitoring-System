import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigation = [
    {
      name: 'Dashboard',
      href: '/faculty/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Students',
      href: '/faculty/students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: 'Pending Reviews',
      href: '/faculty/pending',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: '12'
    }
  ];

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900
      transition-all duration-300 z-40
      ${isOpen ? 'w-64' : 'w-20'}
    `}>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-sm">AMS</span>
          </div>
          {isOpen && (
            <span className="text-white font-semibold text-lg">Faculty Portal</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `
                flex items-center px-3 py-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className={`${!isOpen && 'mx-auto'}`}>
                {item.icon}
              </span>
              {isOpen && (
                <>
                  <span className="ml-3 flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-rose-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
            FA
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Dr. Faculty Advisor</p>
              <p className="text-xs text-indigo-300 truncate">faculty@university.edu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;