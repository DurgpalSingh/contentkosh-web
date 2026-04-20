export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type StudentWithUser = {
  id: number;
  userId: number;
  businessId: number;
  dob?: string | Date;
  gender?: string;
  languages?: string[];
  address?: string;
  city?: string;
  bio?: string;
  status?: StudentStatus;
  user?: {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    role: string;
  };
}

export type CreateStudentRequest = {
  userId: number;
  businessId: number;
  dob?: string;
  gender?: string;
  languages?: string[];
  address?: string;
  city?: string;
  bio?: string;
}

export type UpdateStudentRequest = {
  dob?: string;
  gender?: string;
  languages?: string[];
  address?: string;
  city?: string;
  bio?: string;
  status?: StudentStatus;
}

export type StudentResponse = {
  data: StudentWithUser;
  message: string;
  success: boolean;
}
