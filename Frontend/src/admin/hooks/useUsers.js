import { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../services/adminAPI';

/**
 * Custom hook for managing users state and operations
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  /**
   * Fetch all users
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new user
   */
  const addUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await adminApi.addUser(userData);
      setUsers(prev => [...prev, newUser]);
      setSuccessMessage('User added successfully');
      return newUser;
    } catch (err) {
      setError(err.message || 'Failed to add user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing user
   */
  const updateUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await adminApi.updateUser(userData);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSuccessMessage('User updated successfully');
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a user
   */
  const deleteUser = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await adminApi.deleteUser(email);
      setUsers(prev => prev.filter(u => u.email !== email));
      setSuccessMessage('User deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Assign role to a user
   */
  const assignRole = async (email, role) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await adminApi.assignRole(email, role);
      setUsers(prev => prev.map(u => u.email === email ? updatedUser : u));
      setSuccessMessage('Role assigned successfully');
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to assign role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => setError(null);

  /**
   * Clear success message
   */
  const clearSuccess = () => setSuccessMessage(null);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    successMessage,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    assignRole,
    clearError,
    clearSuccess
  };
};