import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api';

interface StudentState {
  selectedStudentUser: User | null;
  setSelectedStudentUser: (user: User) => void;
  clearSelectedStudentUser: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      selectedStudentUser: null,
      setSelectedStudentUser: (user: User) => set({ selectedStudentUser: user }),
      clearSelectedStudentUser: () => set({ selectedStudentUser: null }),
    }),
    {
      name: 'student-store',
      partialize: (state) => ({ selectedStudentUser: state.selectedStudentUser }),
    }
  )
);
