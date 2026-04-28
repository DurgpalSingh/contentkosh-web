import axios from 'axios';
import { OpenAPI } from '@/lib/api/core/OpenAPI';
import type {
  SettingsProfileResponse,
  UpdateSettingsProfilePayload,
} from '@/lib/api/models/SettingsProfile';

const API_BASE_URL = OpenAPI.BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const normalizeBaseUrl = (baseUrl: string): string => {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, '');
  return trimmedBaseUrl.endsWith('/api') ? trimmedBaseUrl : `${trimmedBaseUrl}/api`;
};

const SETTINGS_PROFILE_ENDPOINT = `${normalizeBaseUrl(API_BASE_URL)}/settings/profile`;

export class SettingsService {
  static async getSettingsProfile(): Promise<SettingsProfileResponse> {
    const response = await axios.get(SETTINGS_PROFILE_ENDPOINT, {
      withCredentials: true
    });
    return response.data?.data;
  }

  static async updateSettingsProfile(
    payload: UpdateSettingsProfilePayload
  ): Promise<SettingsProfileResponse> {
    const formData = new FormData();
    if (payload.userDetails) formData.append('userDetails', JSON.stringify(payload.userDetails));
    if (payload.profileDetails) formData.append('profileDetails', JSON.stringify(payload.profileDetails));
    if (payload.businessDetails) formData.append('businessDetails', JSON.stringify(payload.businessDetails));
    if (payload.profilePictureFile) formData.append('profilePicture', payload.profilePictureFile);
    if (payload.businessLogoFile) formData.append('businessLogo', payload.businessLogoFile);

    const response = await axios.put(SETTINGS_PROFILE_ENDPOINT, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data?.data;
  }
}
