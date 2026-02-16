'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Bell, TrendingUp, UserPlus, LucideIcon } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBatches: 0,
    totalCourses: 0,
    announcements: 0,
  });

  // TODO: Replace with actual API calls
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        activeBatches: 8,
        totalCourses: 24,
        announcements: 12,
      });
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your coaching institute</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="h-4 w-4 inline mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change="+12%"
          changeType="positive"
          icon={Users}
          description="Registered users"
        />
        <StatCard
          title="Active Batches"
          value={stats.activeBatches}
          change="+2"
          changeType="positive"
          icon={Calendar}
          description="Currently running"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          change="+3"
          changeType="positive"
          icon={BookOpen}
          description="Available courses"
        />
        <StatCard
          title="Announcements"
          value={stats.announcements}
          change="+5"
          changeType="positive"
          icon={Bell}
          description="Recent updates"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentUsers />
        <SystemOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <RecentActivity />
        <UpcomingEvents />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description
}: {
  title: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIcon;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex flex-col items-end">
          <Icon className="h-8 w-8 text-blue-600 mb-2" />
          <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

function RecentUsers() {
  const users = [
    { name: 'John Doe', email: 'john@example.com', role: 'Student', joinDate: '2 hours ago' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Teacher', joinDate: '4 hours ago' },
    { name: 'Mike Johnson', email: 'mike@example.com', role: 'Student', joinDate: '1 day ago' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
      <div className="space-y-3">
        {users.map((user, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
              <p className="text-xs text-gray-500 mt-1">{user.joinDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemOverview() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Server Status</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Online
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Database</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Connected
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Storage Used</span>
          <span className="text-sm font-medium text-gray-900">2.4 GB / 10 GB</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { title: 'Create Batch', description: 'Set up a new student batch', icon: Calendar },
    { title: 'Add Course', description: 'Create a new course', icon: BookOpen },
    { title: 'Send Announcement', description: 'Notify all users', icon: Bell },
    { title: 'Manage Users', description: 'Add or edit users', icon: Users },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <action.icon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900">{action.title}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    { action: 'New user registered', user: 'John Doe', time: '2 hours ago' },
    { action: 'Batch created', user: 'Admin', time: '4 hours ago' },
    { action: 'Course updated', user: 'Jane Smith', time: '6 hours ago' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingEvents() {
  const events = [
    { title: 'Batch 2024-01 starts', date: 'Tomorrow', type: 'batch' },
    { title: 'Monthly assessment', date: 'Next week', type: 'exam' },
    { title: 'Parent meeting', date: 'Next month', type: 'meeting' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{event.title}</p>
              <p className="text-sm text-gray-500">{event.date}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.type === 'batch' ? 'bg-blue-100 text-blue-800' :
              event.type === 'exam' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
              {event.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
