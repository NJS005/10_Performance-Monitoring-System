import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDashboardStats } from '../../features/faculty/hooks/useStudents';
import DarkModeToggle from '../../../DarkModeToggle';

const Sidebar = ({ isOpen, setIsOpen, mobileOpen, setMobileOpen }) => {
  const { data: stats } = useDashboardStats();
  const pendingCount = stats?.pending || 0;

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
      badge: pendingCount > 0 ? String(pendingCount) : null
    }
  ];

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name?.toUpperCase() || "Faculty Advisor";
  const displayName = userName.toLowerCase().startsWith("dr") ? userName : `Dr. ${userName}`;

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-white/10">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">AMS</span>
          </div>
          {(mobile ? true : isOpen) && (
            <span className="text-white font-semibold text-lg">Faculty Portal</span>
          )}
        </div>
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="text-white hover:bg-white/10 p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => mobile && setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center px-3 py-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-indigo-600/30 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <span className={`${!(mobile || isOpen) && 'mx-auto'}`}>
                {item.icon}
              </span>
              {(mobile || isOpen) && (
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

      {/* Dark mode toggle + User profile */}
      <div className="p-4 border-t border-slate-600 space-y-3">
        <DarkModeToggle className="w-full" />
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
            FA
          </div>
          {(mobile || isOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'faculty@university.edu'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gradient-to-b from-slate-800 to-slate-700
        transition-all duration-300 z-40 flex flex-col
        hidden lg:flex
        ${isOpen ? 'w-64' : 'w-20'}
      `}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-800 to-slate-700
        transition-transform duration-300 z-40 flex flex-col lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent mobile />
      </div>
    </>
  );
};

export default Sidebar;