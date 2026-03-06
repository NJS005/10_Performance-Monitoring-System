import React, { useState } from 'react';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import RoleAssignModal from '../components/RoleAssignModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useUsers } from '../hooks/useUsers';

/**
 * Main admin dashboard page
 */
const AdminDashboard = () => {
  const {
    users,
    loading,
    error,
    successMessage,
    addUser,
    updateUser,
    deleteUser,
    assignRole,
    clearError,
    clearSuccess
  } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  
  const handleAddUser = async (userData) => {
    try {
      await addUser(userData);
      setShowForm(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle edit user
  const handleEditUser = async (userData) => {
    try {
      await updateUser(userData);
      setEditingUser(null);
      setShowForm(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  
  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.email);
        setShowDeleteModal(false);
        setUserToDelete(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  
  const handleAssignRole = async (email, role) => {
    try {
      await assignRole(email, role);
      setShowRoleModal(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  
  const openEditForm = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  
  const openAddForm = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  
  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  
  const openRoleModal = () => {
    setShowRoleModal(true);
  };

  
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage students, faculty, and administrators in the Performance Monitoring System
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <button onClick={clearSuccess} className="ml-3 text-green-600 hover:text-green-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={clearError} className="ml-3 text-red-600 hover:text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Action Buttons - Add User and Assign Role */}
        {!showForm ? (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={openAddForm}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </button>
            
            <button
              onClick={openRoleModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Assign Role
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <UserForm
              user={editingUser}
              onSubmit={editingUser ? handleEditUser : handleAddUser}
              onCancel={closeForm}
              isEdit={!!editingUser}
            />
          </div>
        )}

        {/* User Table */}
        <UserTable
          users={users}
          onEdit={openEditForm}
          onDelete={openDeleteModal}
          onAssignRole={openRoleModal}
          loading={loading}
        />
      </div>

      {/* Role Assignment Modal */}
      <RoleAssignModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onAssign={handleAssignRole}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        userName={userToDelete?.name}
      />
    </div>
  );
};

export default AdminDashboard;