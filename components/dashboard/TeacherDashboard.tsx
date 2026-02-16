'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, TrendingUp, Plus, LucideIcon } from 'lucide-react';

export function TeacherDashboard() {
  const [stats, setStats] = useState({
    myClasses: 0,
    totalStudents: 0,
    upcomingClasses: 0,
    completedClasses: 0,
  });

  // TODO: Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setStats({
        myClasses: 4,
        totalStudents: 89,
        upcomingClasses: 3,
        completedClasses: 156,
      });
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your classes and students</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 inline mr-2" />
            New Class
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Classes"
          value={stats.myClasses}
          change="+1"
          changeType="positive"
          icon={BookOpen}
          description="Active classes"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          change="+5"
          changeType="positive"
          icon={Users}
          description="Enrolled students"
        />
        <StatCard
          title="Upcoming Classes"
          value={stats.upcomingClasses}
          change="Today"
          changeType="neutral"
          icon={Clock}
          description="Scheduled today"
        />
        <StatCard
          title="Completed Classes"
          value={stats.completedClasses}
          change="+12"
          changeType="positive"
          icon={TrendingUp}
          description="This month"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaySchedule />
        <MyClasses />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <RecentActivity />
        <StudentProgress />
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
  changeType: 'positive' | 'negative' | 'neutral';
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
          <Icon className="h-8 w-8 text-green-600 mb-2" />
          <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' :
              'text-gray-600'
            }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

function TodaySchedule() {
  const schedule = [
    { time: '09:00 AM', subject: 'Mathematics', batch: 'Batch A', duration: '2 hours' },
    { time: '11:30 AM', subject: 'Physics', batch: 'Batch B', duration: '1.5 hours' },
    { time: '02:00 PM', subject: 'Chemistry', batch: 'Batch C', duration: '2 hours' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h3>
      <div className="space-y-4">
        {schedule.map((classItem, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="text-center mr-4">
                <p className="text-sm font-medium text-gray-900">{classItem.time}</p>
                <p className="text-xs text-gray-500">{classItem.duration}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">{classItem.subject}</p>
                <p className="text-sm text-gray-500">{classItem.batch}</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Start Class
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyClasses() {
  const classes = [
    { name: 'Mathematics - Batch A', students: 25, nextClass: 'Tomorrow 9:00 AM' },
    { name: 'Physics - Batch B', students: 20, nextClass: 'Today 11:30 AM' },
    { name: 'Chemistry - Batch C', students: 18, nextClass: 'Today 2:00 PM' },
    { name: 'Biology - Batch D', students: 22, nextClass: 'Tomorrow 10:00 AM' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h3>
      <div className="space-y-3">
        {classes.map((classItem, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{classItem.name}</p>
              <p className="text-sm text-gray-500">{classItem.students} students</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{classItem.nextClass}</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { title: 'Start Class', description: 'Begin a live session', icon: Calendar },
    { title: 'Upload Material', description: 'Share study materials', icon: BookOpen },
    { title: 'Mark Attendance', description: 'Take student attendance', icon: Users },
    { title: 'Create Assignment', description: 'Assign homework', icon: Plus },
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
    { action: 'Completed Mathematics class', time: '2 hours ago' },
    { action: 'Uploaded Physics notes', time: '4 hours ago' },
    { action: 'Marked attendance for Batch A', time: '6 hours ago' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentProgress() {
  const students = [
    { name: 'John Doe', progress: 85, lastActive: '2 hours ago' },
    { name: 'Jane Smith', progress: 92, lastActive: '1 hour ago' },
    { name: 'Mike Johnson', progress: 78, lastActive: '3 hours ago' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Progress</h3>
      <div className="space-y-4">
        {students.map((student, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{student.name}</p>
              <p className="text-sm text-gray-500">{student.progress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${student.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Last active: {student.lastActive}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
