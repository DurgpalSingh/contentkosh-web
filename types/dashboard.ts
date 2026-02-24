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
}

export type DashboardData = AdminDashboardData | TeacherDashboardData | StudentDashboardData;

export const isAdminDashboardData = (data: DashboardData): data is AdminDashboardData =>
  'totalUsers' in data.stats;

export const isTeacherDashboardData = (data: DashboardData): data is TeacherDashboardData =>
  'totalBatches' in data.stats && 'recentContent' in data;

export const isStudentDashboardData = (data: DashboardData): data is StudentDashboardData =>
  'enrolledBatches' in data.stats;
