import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/mock/my';

export interface MyActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  description?: string;
  calories?: number;
  user_id: number;
}

export interface MyUser {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export const useMyData = () => {
  const [activities, setActivities] = useState<MyActivity[]>([]);
  const [user, setUser] = useState<MyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica le attività
  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/activities`);
      if (!response.ok) throw new Error('Errore nel caricamento delle attività');
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  // Carica i dati utente
  const loadUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`);
      if (!response.ok) throw new Error('Errore nel caricamento dei dati utente');
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  // Aggiunge una nuova attività
  const addActivity = async (activity: Omit<MyActivity, 'id' | 'user_id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
      
      if (!response.ok) throw new Error('Errore nell\'aggiunta dell\'attività');
      
      const newActivity = await response.json();
      setActivities(prev => [...prev, newActivity]);
      return newActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      throw err;
    }
  };

  // Aggiorna i dati utente
  const updateUser = async (userData: Partial<MyUser>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) throw new Error('Errore nell\'aggiornamento dei dati utente');
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      throw err;
    }
  };

  // Cancella tutte le attività
  const clearActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Errore nella cancellazione delle attività');
      
      setActivities([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      throw err;
    }
  };

  // Carica i dati all'avvio
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadUser(), loadActivities()]);
    };
    loadData();
  }, []);

  return {
    activities,
    user,
    loading,
    error,
    loadActivities,
    loadUser,
    addActivity,
    updateUser,
    clearActivities,
  };
}; 