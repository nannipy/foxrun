const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  strava_id: number;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  last_sync_timestamp?: string;
}

export interface Activity {
  id: number;
  strava_activity_id: number;
  user_id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain?: number;
  type: string;
  start_date: string;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  map_polyline?: string;
  summary_polyline?: string;
  detailed_data?: string;
  created_at: string;
  updated_at: string;
  laps?: any[];
}

export interface UserStats {
  total_activities: number;
  total_distance: number;
  total_time: number;
  total_elevation: number;
  average_pace: number;
}

export interface Trends {
  period: string;
  trends: Record<string, {
    distance: number;
    time: number;
    activities: number;
    elevation: number;
  }>;
}

class MockApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Mock endpoints
  async getMockUser(): Promise<User> {
    return this.request('/mock/user');
  }

  async getMockActivities(): Promise<{
    activities: Activity[];
    total: number;
    skip: number;
    limit: number;
  }> {
    return this.request('/mock/activities');
  }

  async getMockStats(): Promise<UserStats> {
    return this.request('/mock/stats');
  }

  async getMockTrends(): Promise<Trends> {
    return this.request('/mock/trends');
  }

  async getMockActivityDetail(activityId: number): Promise<Activity> {
    return this.request(`/mock/activity/${activityId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

export const mockApiService = new MockApiService(); 