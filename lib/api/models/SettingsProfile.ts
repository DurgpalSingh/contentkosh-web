export type SettingsRole = 'ADMIN' | 'SUPERADMIN' | 'TEACHER' | 'STUDENT' | 'USER';
export type SettingsGender = 'male' | 'female' | 'other';

export interface SettingsTeacherProfile {
  id?: number;
  qualification?: string | null;
  experienceYears?: number | null;
  designation?: string | null;
  bio?: string | null;
  languages?: string[];
  gender?: SettingsGender | null;
  dob?: string | null;
  address?: string | null;
}

export interface SettingsStudentProfile {
  id?: number;
  gender?: SettingsGender | null;
  dob?: string | null;
  languages?: string[];
  address?: string | null;
  city?: string | null;
  bio?: string | null;
}

export interface SettingsBusinessDetails {
  id?: number;
  instituteName?: string | null;
  tagline?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  address?: string | null;
  logo?: string | null;
}

export interface SettingsProfileResponse {
  id?: number;
  email?: string;
  name?: string;
  mobile?: string;
  profilePicture?: string | null;
  role?: SettingsRole;
  businessId?: number | null;
  teacher?: SettingsTeacherProfile | null;
  student?: SettingsStudentProfile | null;
  business?: SettingsBusinessDetails | null;
}

export interface UpdateSettingsProfilePayload {
  userDetails?: {
    name?: string;
    mobile?: string;
    profilePicture?: string | null;
  };
  profileDetails?: {
    qualification?: string;
    experienceYears?: number;
    designation?: string;
    bio?: string;
    languages?: string[];
    gender?: SettingsGender;
    dob?: string;
    address?: string;
    city?: string;
  };
  businessDetails?: {
    instituteName?: string;
    tagline?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    logo?: string | null;
  };
  profilePictureFile?: File | null;
  businessLogoFile?: File | null;
}
