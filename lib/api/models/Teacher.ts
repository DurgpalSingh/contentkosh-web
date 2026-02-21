/* generated teacher models */

export enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export type ProfessionalDetails = {
  qualification: string;
  experienceYears: number;
  designation: string;
  bio?: string;
  languages?: string[];
}

export type PersonalDetails = {
  gender?: Gender;
  dob?: string;
  address?: string;
}

export type Teacher = {
  id: number;
  userId: number;
  businessId: number;
  professional: ProfessionalDetails;
  personal?: PersonalDetails;
  status: TeacherStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

export type CreateTeacherRequest = {
  userId: number;
  businessId: number;
  professional: ProfessionalDetails;
  personal?: PersonalDetails;
}

export type UpdateTeacherRequest = {
  userId: number;
  businessId: number;
  professional?: ProfessionalDetails;
  personal?: PersonalDetails;
  status?: TeacherStatus;
}

export type TeacherResponse = {
  data: Teacher;
  message: string;
  success: boolean;
}
