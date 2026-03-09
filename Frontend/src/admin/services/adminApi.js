/**
 * Mock API service for admin operations
 * Replace these functions with actual REST API calls to Spring Boot backend
 */

// Mock database
let mockUsers = [
  {
    id: '1',
    name: 'Dr. Pankaj Kumar',
    email: 'pankaj.kumar@institute.edu',
    department: 'Computer Science',
    role: 'FACULTY'
  },
  {
    id: '2',
    name: 'Dr. Neeraj S',
    email: 'neeraj.s@institute.edu',
    department: 'Computer Science',
    role: 'FACULTY'
  },
  {
    id: '3',
    name: 'Jesvin Jaison Kurisingal',
    email: 'jesvin.b230359cs@institute.edu',
    department: 'Computer Science',
    role: 'STUDENT'
  },
  {
    id: '4',
    name: 'Muhammed Abdul Kader V',
    email: 'kader.b230679cs@institute.edu',
    department: 'Computer Science',
    role: 'STUDENT'
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@institute.edu',
    department: 'Administration',
    role: 'ADMIN'
  }
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all users
 * @returns {Promise<Array>} List of users
 */
export const getUsers = async () => {
  await delay();
  return [...mockUsers];
};

/**
 * Add a new user
 * @param {Object} user - User data
 * @returns {Promise<Object>} Created user
 */
export const addUser = async (user) => {
  await delay();
  
  // Check if email already exists
  const exists = mockUsers.find(u => u.email === user.email);
  if (exists) {
    throw new Error('User with this email already exists');
  }
  
  const newUser = {
    id: String(Date.now()),
    ...user
  };
  
  mockUsers.push(newUser);
  return newUser;
};

/**
 * Update an existing user
 * @param {Object} user - User data with id
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (user) => {
  await delay();
  
  const index = mockUsers.findIndex(u => u.id === user.id);
  if (index === -1) {
    throw new Error('User not found');
  }
  
  mockUsers[index] = { ...mockUsers[index], ...user };
  return mockUsers[index];
};

/**
 * Delete a user by email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const deleteUser = async (email) => {
  await delay();
  
  const index = mockUsers.findIndex(u => u.email === email);
  if (index === -1) {
    throw new Error('User not found');
  }
  
  mockUsers.splice(index, 1);
};

/**
 * Assign role to a user by email
 * @param {string} email - User email
 * @param {string} role - Role to assign
 * @returns {Promise<Object>} Updated user
 */
export const assignRole = async (email, role) => {
  await delay();
  
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('User not found');
  }
  
  user.role = role;
  return user;
};