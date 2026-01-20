'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <DefaultDashboard />;
}

function DefaultDashboard() {
  const { business } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome to {business?.instituteName || 'Contentkosh'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          value="0"
          description="Registered users"
          icon="👥"
        />
        <DashboardCard
          title="Active Batches"
          value="0"
          description="Currently running"
          icon="📚"
        />
        <DashboardCard
          title="Courses"
          value="0"
          description="Available courses"
          icon="🎓"
        />
        <DashboardCard
          title="Announcements"
          value="0"
          description="Recent updates"
          icon="📢"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, description, icon }: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span>System initialized</span>
          <span className="ml-auto text-gray-400">Just now</span>
        </div>
        <div className="text-sm text-gray-500 text-center py-4">
          No recent activity to display
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full text-left p-3 h-auto justify-start border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-medium text-gray-900">Create New Batch</div>
            <div className="text-sm text-gray-500">Set up a new student batch</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full text-left p-3 h-auto justify-start border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-medium text-gray-900">Add Course</div>
            <div className="text-sm text-gray-500">Create a new course</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full text-left p-3 h-auto justify-start border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-medium text-gray-900">Send Announcement</div>
            <div className="text-sm text-gray-500">Notify users about updates</div>
          </div>
        </Button>
      </div>
    </div>
  );
}