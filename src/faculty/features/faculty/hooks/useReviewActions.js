import { useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/facultyService';

export const useReviewActions = () => {
  const queryClient = useQueryClient();

  const approveStudent = useMutation({
    mutationFn: (studentId) => facultyService.approveStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const rejectStudent = useMutation({
    mutationFn: ({ studentId, remarks }) => facultyService.rejectStudent(studentId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  return {
    approveStudent,
    rejectStudent
  };
};