const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  strava_id: number;
  first_name: string;
  last_name: string;
  strava_profile_url?: string;
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
  laps?: Lap[];
}

export interface Lap {
  id: number;
  lap_index: number;
  distance: number;
  moving_time: number;
  average_speed?: number;
  start_date: string;
}

export interface UserStats {
  total_activities: number;
  total_distance: number;
  total_time: number;
  total_elevation: number;
  average_pace: number;
  total_activities_all?: number;
  num_bike?: number;
  num_tennis?: number;
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

export interface SyncResult {
  message: string;
  sync_result: {
    synced_count: number;
    updated_count: number;
    total_activities: number;
  };
}

class ApiService {
  // JWT token management
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  clearToken(): void {
    localStorage.removeItem('access_token');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('[API] Request:', url, options);

    // Get auth token and add to headers
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    let responseBody;
    try {
      responseBody = await response.clone().json();
    } catch (e) {
      responseBody = null;
    }
    console.log('[API] Response:', response.status, response.statusText, responseBody);

    if (!response.ok) {
      console.error('[API] Error:', response.status, response.statusText, responseBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(responseBody)}`);
    }

    return responseBody;
  }

  // Auth endpoints
  async getStravaAuthUrl(): Promise<{ authorization_url: string }> {
    return this.request('/auth/strava/authorize');
  }

  async handleStravaCallback(code: string): Promise<{
    message: string;
    access_token: string;
    token_type: string;
    user_id: number;
    strava_id: number;
    first_name: string;
    last_name: string;
  }> {
    console.log('[API] handleStravaCallback: code =', code);
    const response = await this.request<{
      message: string;
      access_token: string;
      token_type: string;
      user_id: number;
      strava_id: number;
      first_name: string;
      last_name: string;
    }>(`/auth/strava/callback?code=${code}`);

    // Save the JWT token
    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async getUser(userId: number): Promise<User> {
    return this.request(`/auth/user/${userId}`);
  }

  // Activities endpoints
  async syncActivities(afterDate?: string): Promise<SyncResult> {
    const params = afterDate ? `?after_date=${afterDate}` : '';
    return this.request(`/activities/sync${params}`, {
      method: 'POST',
    });
  }

  async syncActivitiesSmart(): Promise<SyncResult> {
    return this.request(`/activities/sync/smart`, {
      method: 'POST',
    });
  }

  async syncActivitiesExtend(monthsBack: number = 12): Promise<SyncResult> {
    return this.request(`/activities/sync/extend?months_back=${monthsBack}`, {
      method: 'POST',
    });
  }

  async getUserActivities(
    options?: {
      skip?: number;
      limit?: number;
      activity_type?: string;
      start_date?: string;
      end_date?: string;
      sort_by?: string;
      sort_order?: string;
    }
  ): Promise<{
    activities: Activity[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return this.request(`/activities/?${params.toString()}`);
  }

  async getActivityDetail(activityId: number): Promise<Activity> {
    return this.request(`/activities/${activityId}`);
  }

  async getUserStats(
    options?: {
      startDate?: string;
      endDate?: string;
      activity_type?: string;
    }
  ): Promise<UserStats> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('start_date', options.startDate);
    if (options?.endDate) params.append('end_date', options.endDate);
    if (options?.activity_type) params.append('activity_type', options.activity_type);
    return this.request(`/activities/stats/summary?${params.toString()}`);
  }

  async getUserTrends(period: string = 'month', activity_type?: string): Promise<Trends> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (activity_type) params.append('activity_type', activity_type);
    return this.request(`/activities/trends/summary?${params.toString()}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // User settings and profile endpoints
  async updateProfileImage(userId: number, formData: FormData): Promise<{ message: string; profile_picture_url: string }> {
    const url = `${API_BASE_URL}/auth/user/${userId}/profile-image`;
    console.log('[API] Upload profile image:', url);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Non includere Content-Type per FormData, il browser lo imposterà automaticamente
    });

    let responseBody;
    try {
      responseBody = await response.clone().json();
    } catch (e) {
      responseBody = null;
    }
    console.log('[API] Response:', response.status, response.statusText, responseBody);

    if (!response.ok) {
      console.error('[API] Error:', response.status, response.statusText, responseBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(responseBody)}`);
    }

    return responseBody;
  }

  async updateUserSettings(userId: number, settings: any): Promise<{ message: string }> {
    return this.request(`/auth/user/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService(); 