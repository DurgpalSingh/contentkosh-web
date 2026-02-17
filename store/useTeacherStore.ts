import { create } from 'zustand';
import { User } from '@/lib/api';

interface TeacherState {
  selectedTeacherUser: User | null;
  setSelectedTeacherUser: (user: User) => void;
  clearSelectedTeacherUser: () => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  selectedTeacherUser: null,
  setSelectedTeacherUser: (user: User) => set({ selectedTeacherUser: user }),
  clearSelectedTeacherUser: () => set({ selectedTeacherUser: null }),
}));

