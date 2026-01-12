import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, User } from '@/lib/api';

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored) : null;
  });
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query per ottenere i dati dell'utente
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      let attempts = 0;
      let lastError;
      while (attempts < 3) {
        try {
          return await apiService.getUser(userId!);
        } catch (err: any) {
          lastError = err;
          if (err.message && err.message.includes('500')) {
            attempts++;
            await new Promise(res => setTimeout(res, 500));
          } else {
            throw err;
          }
        }
      }
      throw lastError;
    },
    enabled: !!userId,
  });

  // Funzione per sincronizzare con gestione errori
  const performSync = async (userId: number, context: string = 'manual') => {
    try {
      console.log(`[SYNC] Inizio sincronizzazione ${context} per user_id=${userId}`);
      setIsAutoSyncing(true);
      setLastSyncError(null);

      await apiService.syncActivities();
      console.log(`[SYNC] Sincronizzazione ${context} completata con successo`);

      // Invalida le query per aggiornare i dati nell'interfaccia
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['trends', userId] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });

    } catch (error: any) {
      console.error(`[SYNC] Errore durante la sincronizzazione ${context}:`, error);

      // Gestisci specificamente gli errori di rate limit
      if (error?.response?.status === 429) {
        const retryAfter = error.response?.data?.retry_after_seconds || 60;
        const errorMessage = `Rate limit raggiunto. Riprova tra ${retryAfter} secondi.`;
        setLastSyncError(errorMessage);
        console.log(`[SYNC] Rate limit raggiunto, riprova tra ${retryAfter} secondi`);

        // Non riprovare automaticamente per evitare loop infiniti
        return;
      }

      // Per altri errori, mostra il messaggio
      setLastSyncError(error?.message || 'Errore durante la sincronizzazione');

    } finally {
      setIsAutoSyncing(false);
    }
  };

  // Mutation per gestire il callback di Strava
  const stravaCallbackMutation = useMutation({
    mutationFn: (code: string) => apiService.handleStravaCallback(code),
    onSuccess: (data) => {
      setTimeout(() => {
        setUserId(data.user_id);
        localStorage.setItem('userId', data.user_id.toString());
        queryClient.invalidateQueries({ queryKey: ['user'] });

        // DISABILITATO: Sincronizzazione automatica dopo il login per evitare rate limit
        // setTimeout(async () => {
        //   await performSync(data.user_id, 'post-login');
        // }, 2000);
        console.log('[SYNC] Sincronizzazione automatica post-login disabilitata per evitare rate limit');
      }, 1000); // 1 secondo di delay
    },
  });

  // Mutation per ottenere l'URL di autorizzazione
  const authUrlMutation = useMutation({
    mutationFn: () => apiService.getStravaAuthUrl(),
  });

  const login = async () => {
    try {
      const { authorization_url } = await authUrlMutation.mutateAsync();
      window.location.href = authorization_url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const logout = () => {
    setUserId(null);
    setHasAutoSynced(false); // Reset per permettere sincronizzazione al prossimo login
    setLastSyncError(null);
    localStorage.removeItem('userId');
    apiService.clearToken(); // Clear JWT token
    queryClient.clear();
  };

  const handleStravaCallback = (code: string) => {
    return stravaCallbackMutation.mutateAsync(code);
  };


  // NOTA: La gestione del callback di Strava è ora gestita SOLO dal componente AuthCallback.tsx
  // per evitare doppie chiamate che causano l'invalidazione del code.
  // Non gestiamo qui il callback automaticamente.


  // Sincronizzazione automatica solo all'avvio per utenti esistenti
  const [hasAutoSynced, setHasAutoSynced] = useState(false);

  useEffect(() => {
    if (userId && user && !hasAutoSynced && !isAutoSyncing) {
      // DISABILITATO: Sincronizzazione automatica all'avvio per evitare rate limit
      console.log('[SYNC] Sincronizzazione automatica all\'avvio disabilitata per evitare rate limit');
      setHasAutoSynced(true); // Marca come già controllato

      // Controlla se è passato più di 1 ora dall'ultima sincronizzazione
      // const lastSync = user.last_sync_timestamp;
      // const shouldSync = !lastSync || 
      //   (new Date().getTime() - new Date(lastSync).getTime()) > 60 * 60 * 1000; // 1 ora

      // if (shouldSync) {
      //   console.log('Sincronizzazione automatica all\'avvio per utente esistente...');
      //   setHasAutoSynced(true); // Marca come già sincronizzato per questa sessione

      //   setTimeout(async () => {
      //     await performSync(userId, 'startup');
      //   }, 3000); // 3 secondi di delay per non interferire con il caricamento iniziale
      // } else {
      //   setHasAutoSynced(true); // Marca come già controllato anche se non serve sincronizzare
      // }
    }
  }, [userId, user, hasAutoSynced, isAutoSyncing]);

  return {
    user,
    userId,
    isLoadingUser,
    userError,
    login,
    logout,
    handleStravaCallback,
    isAuthenticated: !!userId,
    isLoggingIn: authUrlMutation.isPending,
    isHandlingCallback: stravaCallbackMutation.isPending,
    isAutoSyncing,
    lastSyncError,
    performSync,
  };
}; 