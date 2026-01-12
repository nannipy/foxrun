import { useQuery } from '@tanstack/react-query';
import { mockApiService } from '@/lib/mockApi';

export const useMockUser = () => {
  return useQuery({
    queryKey: ['mock-user'],
    queryFn: () => mockApiService.getMockUser(),
  });
};

export const useMockActivities = () => {
  return useQuery({
    queryKey: ['mock-activities'],
    queryFn: () => mockApiService.getMockActivities(),
  });
};

export const useMockStats = () => {
  return useQuery({
    queryKey: ['mock-stats'],
    queryFn: () => mockApiService.getMockStats(),
  });
};

export const useMockTrends = () => {
  return useQuery({
    queryKey: ['mock-trends'],
    queryFn: () => mockApiService.getMockTrends(),
  });
};

export const useMockActivityDetail = (activityId: number | null) => {
  return useQuery({
    queryKey: ['mock-activity', activityId],
    queryFn: () => mockApiService.getMockActivityDetail(activityId!),
    enabled: !!activityId,
  });
}; 