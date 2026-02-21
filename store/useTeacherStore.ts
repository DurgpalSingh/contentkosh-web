import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api';

interface TeacherState {
  selectedTeacherUser: User | null;
  setSelectedTeacherUser: (user: User) => void;
  clearSelectedTeacherUser: () => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set) => ({
      selectedTeacherUser: null,
      setSelectedTeacherUser: (user: User) => set({ selectedTeacherUser: user }),
      clearSelectedTeacherUser: () => set({ selectedTeacherUser: null }),
    }),
    {
      name: 'teacher-store',
      partialize: (state) => ({ selectedTeacherUser: state.selectedTeacherUser }),
    }
  )
);

