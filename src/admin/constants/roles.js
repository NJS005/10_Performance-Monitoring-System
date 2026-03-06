/**
 * User roles in the Performance Monitoring System
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT'
};

export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.FACULTY, label: 'Faculty' },
  { value: ROLES.STUDENT, label: 'Student' }
];

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
  [ROLES.FACULTY]: 'bg-blue-100 text-blue-800',
  [ROLES.STUDENT]: 'bg-green-100 text-green-800'
};