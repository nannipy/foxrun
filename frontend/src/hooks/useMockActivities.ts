import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiService } from '@/lib/mockApi';

export const useMockActivities = (userId: number | null) => {
  const queryClient = useQueryClient();

  // Query per ottenere le attività mock
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['mock-activities', userId],
    queryFn: () => mockApiService.getMockActivities(),
    enabled: !!userId,
  });

  // Query per ottenere le statistiche mock
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['mock-stats', userId],
    queryFn: () => mockApiService.getMockStats(),
    enabled: !!userId,
  });

  // Query per ottenere le tendenze mock
  const {
    data: trends,
    isLoading: isLoadingTrends,
    error: trendsError,
  } = useQuery({
    queryKey: ['mock-trends', userId],
    queryFn: () => mockApiService.getMockTrends(),
    enabled: !!userId,
  });

  // Mutation per sincronizzare le attività (simulata)
  const syncMutation = useMutation({
    mutationFn: async (afterDate?: string) => {
      // Simula una sincronizzazione
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { synced_count: 0, updated_count: 0, total_activities: 5 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['mock-stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['mock-trends', userId] });
    },
  });

  const syncActivities = (afterDate?: string) => {
    return syncMutation.mutateAsync(afterDate);
  };

  return {
    activities: activitiesData?.activities || [],
    totalActivities: activitiesData?.total || 0,
    isLoadingActivities,
    activitiesError,
    refetchActivities,
    
    stats,
    isLoadingStats,
    statsError,
    
    trends,
    isLoadingTrends,
    trendsError,
    
    syncActivities,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
  };
};

export const useMockActivityDetail = (userId: number | null, activityId: number | null) => {
  const {
    data: activity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mock-activity', userId, activityId],
    queryFn: () => mockApiService.getMockActivityDetail(activityId!),
    enabled: !!userId && !!activityId,
  });

  return {
    activity,
    isLoading,
    error,
  };
}; 