import React, { useState } from 'react';
import { Users, GraduationCap, FileCheck, LogOut, LayoutDashboard, UserCog, UserSquare, Shield, X, Plus, Edit2, Trash2, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';

// Add this to your index.css or global styles
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out;
  }

  .animate-fadeInDown {
    animation: fadeInDown 0.6s ease-out;
  }

  .animate-fadeInRight {
    animation: fadeInRight 0.6s ease-out;
  }

  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }
`;

// Main App Component
export default function AMSAdminPanel() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [showModal, setShowModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {currentScreen === 'login' ? (
        <LoginScreen onLogin={() => setCurrentScreen('dashboard')} />
      ) : (
        <DashboardLayout 
          currentScreen={currentScreen} 
          setCurrentScreen={setCurrentScreen}
          showModal={showModal}
          setShowModal={setShowModal}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      )}
    </div>
  );
}

// Login Screen Component
function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Dark Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Logo */}
        <div className="relative z-10 animate-fadeInDown">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center transform rotate-6 shadow-lg">
              <GraduationCap className="w-7 h-7 text-white -rotate-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AMS</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8 animate-fadeInUp">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold leading-tight tracking-tight">
              Track.<br />
              Verify.<br />
              Grow.
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-md leading-relaxed">
            A unified platform for academic performance monitoring, verification workflows, and student guidance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-4 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <StatCard number="2,847" label="Active Students" icon={Users} />
          <StatCard number="143" label="Faculty Advisors" icon={UserCog} />
          <StatCard number="5,291" label="Reports Generated" icon={FileCheck} />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md animate-fadeInRight">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center transform rotate-6 shadow-lg">
                <GraduationCap className="w-7 h-7 text-white -rotate-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900">AMS</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 lg:p-10 border border-slate-200/50">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500">Sign in to Admin Panel</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                  defaultValue="admin"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                  defaultValue="password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Admin Login
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </a>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            © 2026 AMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component for Login
function StatCard({ number, label, icon: Icon }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <Icon className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
      <div className="text-2xl font-bold mb-1">{number}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

// Dashboard Layout Component
function DashboardLayout({ currentScreen, setCurrentScreen, showModal, setShowModal, selectedItem, setSelectedItem }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Top Bar */}
          <TopBar currentScreen={currentScreen} />
          
          {/* Content Area */}
          <div className="mt-8 animate-fadeIn">
            {currentScreen === 'dashboard' && <DashboardScreen />}
            {currentScreen === 'faculty' && <ManageFacultyScreen showModal={showModal} setShowModal={setShowModal} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />}
            {currentScreen === 'students' && <ManageStudentsScreen showModal={showModal} setShowModal={setShowModal} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />}
            {currentScreen === 'roles' && <AssignRolesScreen />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ currentScreen, setCurrentScreen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty', label: 'Manage Faculty', icon: Users },
    { id: 'students', label: 'Manage Students', icon: GraduationCap },
    { id: 'roles', label: 'Assign Roles', icon: Shield },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center transform rotate-6 shadow-lg">
            <GraduationCap className="w-6 h-6 text-white -rotate-6" />
          </div>
          <span className="text-xl font-bold">AMS Admin</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentScreen === item.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30'
                : 'hover:bg-white/5'
            }`}
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-200 ${
              currentScreen === item.id ? 'scale-110' : 'group-hover:scale-110'
            }`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

// Top Bar Component
function TopBar({ currentScreen }) {
  const titles = {
    dashboard: 'Dashboard',
    faculty: 'Manage Faculty',
    students: 'Manage Students',
    roles: 'Assign Roles'
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{titles[currentScreen]}</h1>
        <p className="text-slate-500 mt-1">Welcome back, Administrator</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>System Active</span>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
          AD
        </div>
      </div>
    </div>
  );
}

// Dashboard Screen Component
function DashboardScreen() {
  const summaryCards = [
    { title: 'Total Students', value: '2,847', change: '+12.5%', icon: GraduationCap, color: 'from-blue-500 to-cyan-500' },
    { title: 'Total Faculty', value: '143', change: '+5.2%', icon: Users, color: 'from-violet-500 to-purple-500' },
    { title: 'Pending Verifications', value: '28', change: '-8.3%', icon: FileCheck, color: 'from-amber-500 to-orange-500' },
    { title: 'Active Reports', value: '856', change: '+18.7%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group animate-fadeInUp"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                card.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {card.change}
              </span>
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Performance Overview</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Biology'].map((dept, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{dept}</span>
                  <span className="font-semibold text-slate-900">{85 - i * 5}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${85 - i * 5}%`, animationDelay: `${i * 0.1}s` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <CheckCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[
              { action: 'New student registered', dept: 'Computer Science', time: '2 min ago' },
              { action: 'Report verified', dept: 'Mathematics', time: '15 min ago' },
              { action: 'Faculty updated profile', dept: 'Physics', time: '1 hour ago' },
              { action: 'Role assigned to advisor', dept: 'Engineering', time: '2 hours ago' },
              { action: 'Performance review completed', dept: 'Biology', time: '3 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.dept} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Manage Faculty Screen Component
function ManageFacultyScreen({ showModal, setShowModal, selectedItem, setSelectedItem }) {
  const facultyData = [
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@ams.edu', department: 'Computer Science' },
    { id: 2, name: 'Prof. Michael Chen', email: 'michael.chen@ams.edu', department: 'Mathematics' },
    { id: 3, name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@ams.edu', department: 'Physics' },
    { id: 4, name: 'Prof. David Kumar', email: 'david.kumar@ams.edu', department: 'Engineering' },
    { id: 5, name: 'Dr. Lisa Thompson', email: 'lisa.thompson@ams.edu', department: 'Biology' },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex justify-end">
          <button
            onClick={() => { setShowModal('addFaculty'); setSelectedItem(null); }}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Faculty</span>
          </button>
        </div>

        {/* Faculty Table */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Department</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyData.map((faculty, index) => (
                  <tr key={faculty.id} className="hover:bg-slate-50 transition-colors duration-150 animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {faculty.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-900">{faculty.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{faculty.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                        {faculty.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setSelectedItem(faculty); setShowModal('editFaculty'); }}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors duration-150"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {(showModal === 'addFaculty' || showModal === 'editFaculty') && (
        <Modal
          title={showModal === 'addFaculty' ? 'Add Faculty Member' : 'Edit Faculty Member'}
          onClose={() => { setShowModal(null); setSelectedItem(null); }}
        >
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                type="text"
                placeholder="Enter faculty name"
                defaultValue={selectedItem?.name || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                defaultValue={selectedItem?.email || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <select
                defaultValue={selectedItem?.department || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              >
                <option value="">Select department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowModal(null); setSelectedItem(null); }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => { e.preventDefault(); setShowModal(null); setSelectedItem(null); }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

// Manage Students Screen Component
function ManageStudentsScreen({ showModal, setShowModal, selectedItem, setSelectedItem }) {
  const studentsData = [
    { id: 1, name: 'Alex Martinez', email: 'alex.martinez@student.ams.edu', department: 'Computer Science', semester: '6th' },
    { id: 2, name: 'Jessica Lee', email: 'jessica.lee@student.ams.edu', department: 'Mathematics', semester: '4th' },
    { id: 3, name: 'Ryan Patel', email: 'ryan.patel@student.ams.edu', department: 'Physics', semester: '5th' },
    { id: 4, name: 'Emma Wilson', email: 'emma.wilson@student.ams.edu', department: 'Engineering', semester: '7th' },
    { id: 5, name: 'Marcus Brown', email: 'marcus.brown@student.ams.edu', department: 'Biology', semester: '3rd' },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex justify-end">
          <button
            onClick={() => { setShowModal('addStudent'); setSelectedItem(null); }}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Department</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Semester</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsData.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors duration-150 animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {student.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                        {student.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setSelectedItem(student); setShowModal('editStudent'); }}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors duration-150"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {(showModal === 'addStudent' || showModal === 'editStudent') && (
        <Modal
          title={showModal === 'addStudent' ? 'Add Student' : 'Edit Student'}
          onClose={() => { setShowModal(null); setSelectedItem(null); }}
        >
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                type="text"
                placeholder="Enter student name"
                defaultValue={selectedItem?.name || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                defaultValue={selectedItem?.email || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <select
                defaultValue={selectedItem?.department || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              >
                <option value="">Select department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Semester</label>
              <select
                defaultValue={selectedItem?.semester || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              >
                <option value="">Select semester</option>
                {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowModal(null); setSelectedItem(null); }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => { e.preventDefault(); setShowModal(null); setSelectedItem(null); }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

// Assign Roles Screen Component
function AssignRolesScreen() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [assignedRole, setAssignedRole] = useState('');

  const handleAssign = (e) => {
    e.preventDefault();
    const role = e.target.role.value;
    setAssignedRole(role);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 animate-fadeInUp">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Assign User Role</h2>
          <p className="text-slate-600">Assign roles to users to control their access and permissions</p>
        </div>

        <form className="space-y-6" onSubmit={handleAssign}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter user email"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select Role</label>
            <select
              name="role"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
            >
              <option value="">Choose a role</option>
              <option value="Admin">Admin</option>
              <option value="Faculty Advisor">Faculty Advisor</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Role Descriptions:</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Admin:</strong> Full system access, manage all users and settings</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Faculty Advisor:</strong> Monitor assigned students, generate reports, verify submissions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Student:</strong> View own performance, submit assignments, access guidance</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Assign Role
          </button>
        </form>

        {/* Confirmation Message */}
        {showConfirmation && (
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-fadeInUp">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Role Assigned Successfully!</p>
              <p className="text-sm text-green-700">User has been assigned the role: {assignedRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Assignments */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Role Assignments</h3>
        <div className="space-y-3">
          {[
            { email: 'john.doe@ams.edu', role: 'Faculty Advisor', time: '2 hours ago' },
            { email: 'jane.smith@student.ams.edu', role: 'Student', time: '5 hours ago' },
            { email: 'admin.new@ams.edu', role: 'Admin', time: '1 day ago' },
          ].map((assignment, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
              <div>
                <p className="text-sm font-medium text-slate-900">{assignment.email}</p>
                <p className="text-xs text-slate-500">{assignment.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                assignment.role === 'Admin' ? 'bg-red-100 text-red-700' :
                assignment.role === 'Faculty Advisor' ? 'bg-indigo-100 text-indigo-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {assignment.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
