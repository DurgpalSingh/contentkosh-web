export type AdminDashboardData = {
  stats: {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalExams: number;
    totalCourses: number;
    totalBatches: number;
    totalContent: number;
    activeAnnouncements: number;
  };
  recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentAnnouncements: Array<{
    id: number;
    heading: string;
    content?: string;
    startDate: string;
    endDate: string;
  }>;
}

export type TeacherDashboardData = {
  stats: {
    totalBatches: number;
    totalStudents: number;
    totalContent: number;
    activeAnnouncements: number;
  };
  myBatches: Array<{
    id: number;
    displayName: string;
    courseName: string;
    studentCount: number;
    isActive: boolean;
  }>;
  recentAnnouncements: Array<{
    id: number;
    heading: string;
    content?: string;
    startDate: string;
    endDate: string;
  }>;
  recentContent: Array<{
    id: number;
    title: string;
    batchName: string;
    createdAt: string;
  }>;
}

export type StudentDashboardData = {
  stats: {
    enrolledBatches: number;
    totalContent: number;
    activeAnnouncements: number;
  };
  myBatches: Array<{
    id: number;
    displayName: string;
    courseName: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>;
  recentAnnouncements: Array<{
    id: number;
    heading: string;
    content: string;
    startDate: string;
    endDate: string;
  }>;
  recentContent: Array<{
    id: number;
    title: string;
    batchName: string;
    type: string;
    createdAt: string;
  }>;
  recentExams: Array<{
    id: string;
    name: string;
    batchName: string;
    startAt: string;
    deadlineAt: string;
  }>;
}

export type DashboardData = AdminDashboardData | TeacherDashboardData | StudentDashboardData;

export const isAdminDashboardData = (data: object): data is AdminDashboardData => {
  if (!data || typeof data !== 'object') return false;
  const d = data as { stats?: { totalUsers?: number } };
  return !!d.stats && typeof d.stats.totalUsers === 'number';
};

export const isTeacherDashboardData = (data: object): data is TeacherDashboardData => {
  if (!data || typeof data !== 'object') return false;
  const d = data as { stats?: { totalBatches?: number }; recentContent?: Array<{ id?: number; title?: string; createdAt?: string }> };
  return !!d.stats && typeof d.stats.totalBatches === 'number' && Array.isArray(d.recentContent);
};

export const isStudentDashboardData = (data: object): data is StudentDashboardData => {
  if (!data || typeof data !== 'object') return false;
  const d = data as { stats?: { enrolledBatches?: number }; recentExams?: unknown[] };
  return !!d.stats && typeof d.stats.enrolledBatches === 'number' && Array.isArray(d.recentExams);
};
