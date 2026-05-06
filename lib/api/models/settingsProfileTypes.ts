import type { ChangeEvent } from 'react';

export type SettingsProfileFormState = {
  name: string;
  mobile: string;
  teacherQualification: string;
  teacherExperienceYears: string;
  teacherDesignation: string;
  teacherBio: string;
  teacherLanguages: string[];
  teacherGender: string;
  teacherDob: string;
  teacherAddress: string;
  studentGender: string;
  studentDob: string;
  studentLanguages: string[];
  studentAddress: string;
  studentCity: string;
  studentBio: string;
  businessInstituteName: string;
  businessTagline: string;
  businessContactNumber: string;
  businessEmail: string;
  businessAddress: string;
};

export type SettingsTextFieldKey = {
  [K in keyof SettingsProfileFormState]: SettingsProfileFormState[K] extends string ? K : never;
}[keyof SettingsProfileFormState];

export type SettingsInputChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

