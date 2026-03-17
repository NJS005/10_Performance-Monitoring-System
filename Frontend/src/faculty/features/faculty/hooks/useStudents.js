import { useQuery } from '@tanstack/react-query';
import { facultyService } from '../services/facultyService';

export const useStudents = (filters) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => facultyService.getStudents(filters),
    staleTime: 30000
  });
};

export const useStudentDetails = (studentId) => {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      // Fetch all three endpoints in parallel
      const [student, courses, coCurricular] = await Promise.all([
        facultyService.getStudentDetails(studentId),
        facultyService.getStudentCourses(studentId),
        facultyService.getStudentCoCurricular(studentId),
      ]);

      // Merge into the shape the component expects
      return {
        ...student,
        academicData: {
          ...(student.academicData || {}),
          courses: courses || [],
        },
        coCurricular: coCurricular || [],
      };
    },
    enabled: !!studentId
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => facultyService.getDashboardStats(),
    refetchInterval: 60000
  });
};