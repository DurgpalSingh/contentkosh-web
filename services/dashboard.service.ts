import { API_BASE_URL } from '@/lib/constants';
import { DashboardData } from '@/types/dashboard';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class DashboardService {
  private static instance: DashboardService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/dashboard`;
  }

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async getDashboard(): Promise<DashboardData> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    const json: ApiResponse<DashboardData> = await response.json();
    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || 'Failed to fetch dashboard');
    }

    return json.data;
  }
}

export const dashboardService = DashboardService.getInstance();
