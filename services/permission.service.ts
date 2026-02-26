import { API_BASE_URL } from '@/lib/constants';

class PermissionService {
    private static instance: PermissionService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = `${API_BASE_URL}/permission`;
    }

    public static getInstance(): PermissionService {
        if (!PermissionService.instance) {
            PermissionService.instance = new PermissionService();
        }
        return PermissionService.instance;
    }

    public async getMyPermissions(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }

            const data = await response.json();
            // Assuming the API returns { data: [ { permission: { code: 'CODE' } } ] } or similar
            // I need to adapt this based on actual API response.
            // Based on common patterns in this repo (ApiResponseHandler), it probably returns { success: true, data: ... }

            // Backend returns { data: { user: {...}, permissions: [...] } }
            // The permissions array is at data.data.permissions
            return data.data.permissions || [];
        } catch (error) {
            console.error('Error fetching permissions:', error);
            return [];
        }
    }
}

export const permissionService = PermissionService.getInstance();
