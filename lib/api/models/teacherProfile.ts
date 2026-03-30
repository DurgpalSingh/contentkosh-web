import type { User } from './User';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | '';

export interface CreateTeacherRequest {
  userId: number;
  businessId: number;
  professional: {
    qualification: string;
    experienceYears: number;
    designation: string;
    bio?: string;
    languages?: string[];
  };
  personal?: {
    gender?: string;
    dob?: string;
    address?: string;
  };
}

export interface UpdateTeacherRequest extends CreateTeacherRequest {}

export interface TeacherWithUser {
  id: number;
  userId?: number;
  businessId?: number;
  qualification?: string;
  experienceYears?: number;
  designation?: string;
  bio?: string;
  languages?: string[];
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  user?: User;
}
