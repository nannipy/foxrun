import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Activity } from '@/lib/api';

export const useActivities = (userId: number | null, periodTrendsRun: string = 'month') => {
  const queryClient = useQueryClient();

  // Query per ottenere le attività dell'utente
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['activities', userId],
    queryFn: () => apiService.getUserActivities(),
    enabled: !!userId,
  });

  // Query per ottenere le statistiche dell'utente (tutte le attività)
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => apiService.getUserStats(),
    enabled: !!userId,
  });

  // Query per ottenere le statistiche solo delle corse
  const {
    data: statsRun,
    isLoading: isLoadingStatsRun,
    error: statsRunError,
    refetch: refetchStatsRun,
  } = useQuery({
    queryKey: ['stats', userId, 'run'],
    queryFn: () => apiService.getUserStats({ activity_type: 'Run' }),
    enabled: !!userId,
  });

  // Query per ottenere le tendenze dell'utente (tutte le attività)
  const {
    data: trends,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['trends', userId],
    queryFn: () => apiService.getUserTrends(),
    enabled: !!userId,
  });

  // Query per ottenere le tendenze solo delle corse
  const {
    data: trendsRun,
    isLoading: isLoadingTrendsRun,
    error: trendsRunError,
    refetch: refetchTrendsRun,
  } = useQuery({
    queryKey: ['trends', userId, 'run', periodTrendsRun],
    queryFn: () => apiService.getUserTrends(periodTrendsRun, 'Run'),
    enabled: !!userId,
  });

  // Mutation per sincronizzare le attività con gestione errori
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID non valido');

      try {
        return await apiService.syncActivities();
      } catch (error: any) {
        // Gestisci specificamente gli errori di rate limit
        if (error?.response?.status === 429) {
          const retryAfter = error.response?.data?.retry_after_seconds || 60;
          throw new Error(`Rate limit raggiunto. Riprova tra ${retryAfter} secondi.`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['trends', userId] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  const syncActivities = () => {
    return syncMutation.mutateAsync();
  };

  return {
    activities: activitiesData?.activities || [],
    totalActivities: activitiesData?.total || 0,
    isLoadingActivities,
    activitiesError,
    refetchActivities,
    refetchStats,
    refetchTrends,
    stats,
    isLoadingStats,
    statsError,
    statsRun,
    isLoadingStatsRun,
    statsRunError,
    refetchStatsRun,
    trends,
    isLoadingTrends,
    trendsError,
    trendsRun,
    isLoadingTrendsRun,
    trendsRunError,
    refetchTrendsRun,
    syncActivities,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
  };
};

export const useActivityDetail = (userId: number | null, activityId: number | null) => {
  const {
    data: activity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activity', userId, activityId],
    queryFn: () => apiService.getActivityDetail(activityId!),
    enabled: !!userId && !!activityId,
  });

  return {
    activity,
    isLoading,
    error,
  };
}; 