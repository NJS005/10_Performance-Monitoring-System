import { useQuery } from '@tanstack/react-query';
import { facultyService } from '../services/facultyService';

export const useStudents = (filters) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => facultyService.getStudents(filters),
    staleTime: 30000 // 30 seconds
  });
};

export const useStudentDetails = (studentId) => {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: () => facultyService.getStudentDetails(studentId),
    enabled: !!studentId
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => facultyService.getDashboardStats(),
    refetchInterval: 60000 // Refetch every minute
  });
};