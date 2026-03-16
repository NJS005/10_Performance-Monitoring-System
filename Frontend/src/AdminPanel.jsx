import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Loader2, X, Edit2 } from 'lucide-react';

export default function AdminPanel() {
  // --- Layout State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- Data & UI State ---
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = Adding, object = Editing
  const [selectedFormRole, setSelectedFormRole] = useState(''); // Controls conditional faculty fields

  // 1. Fetch Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/all'); 
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Delete User
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This will also remove their faculty access if applicable.")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setUsers(users.filter(user => user.id !== id));
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // 3. Add / Edit User Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const role = e.target.role.value;
    
    // Base data for User table
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      role: role
    };

    // Attach extra fields if they are a Faculty Advisor
    if (role === 'Faculty Advisor') {
      formData.department = e.target.department?.value || '';
      formData.designation = e.target.designation?.value || '';
      formData.contactNo = e.target.contactNo?.value || '';
    }

    // Determine if we are updating or creating
    const url = editingUser 
      ? `http://localhost:8080/api/users/${editingUser.id}` 
      : `http://localhost:8080/api/users`;
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchUsers(); // Refresh table
        closeModal(); // Clean up and close
      } else {
        alert(`Failed to ${editingUser ? 'update' : 'create'} user.`);
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // Helper to cleanly open the modal for Adding
  const openAddModal = () => {
    setEditingUser(null);
    setSelectedFormRole('');
    setIsModalOpen(true);
  };

  // Helper to cleanly open the modal for Editing
  const openEditModal = (user) => {
    setEditingUser(user);
    setSelectedFormRole(user.role || '');
    setIsModalOpen(true);
  };

  // Helper to cleanly close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setSelectedFormRole('');
  };

  // 4. Search Filter
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AMS</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Sidebar Layout */}
      <aside className={`fixed top-0 left-0 z-30 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-white shadow-lg w-64 flex flex-col`}>
        <div className="px-6 py-6 border-b border-gray-200 mt-12 lg:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AMS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">System Management</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium cursor-pointer">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>
             <span>User Management</span>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} pt-16 lg:pt-0`}>
        <div className="p-4 sm:p-8 min-h-screen space-y-6">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">User Management Dashboard</h1>
            <p className="text-gray-500">View, search, add, edit, and remove system users.</p>
          </div>

          {/* Top Bar: Search & Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex w-full sm:w-auto items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Role</th>
                    <th className="text-right px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'Student' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Edit Button */}
                            <button 
                              onClick={() => openEditModal(user)} 
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {/* Delete Button */}
                            <button 
                              onClick={() => handleDelete(user.id)} 
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form key={editingUser ? editingUser.id : 'new'} onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingUser?.name || ''} 
                  required 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingUser?.email || ''} 
                  required 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  name="role" 
                  defaultValue={editingUser?.role || ''} 
                  onChange={(e) => setSelectedFormRole(e.target.value)}
                  required 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                >
                  <option value="">Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="Faculty Advisor">Faculty Advisor</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              {/* CONDITIONALLY RENDERED FACULTY FIELDS */}
              {selectedFormRole === 'Faculty Advisor' && (
                <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Faculty Details</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input 
                      type="text" 
                      name="department" 
                      placeholder="e.g. Computer Science" 
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <input 
                        type="text" 
                        name="designation" 
                        placeholder="e.g. Professor" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
                      <input 
                        type="number" 
                        name="contactNo" 
                        placeholder="10-digit number" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 flex space-x-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  {editingUser ? 'Update User' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}