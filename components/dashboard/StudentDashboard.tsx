'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, TrendingUp, Download, Play, LucideIcon } from 'lucide-react';

export function StudentDashboard() {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    upcomingClasses: 0,
    assignments: 0,
  });

  // TODO: Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setStats({
        enrolledCourses: 3,
        completedLessons: 24,
        upcomingClasses: 2,
        assignments: 5,
      });
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Track your learning progress</p>
        </div>
        <div className="text-sm text-gray-500">
          Welcome back! Keep learning.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Enrolled Courses"
          value={stats.enrolledCourses}
          change="+1"
          changeType="positive"
          icon={BookOpen}
          description="Active courses"
        />
        <StatCard
          title="Completed Lessons"
          value={stats.completedLessons}
          change="+3"
          changeType="positive"
          icon={TrendingUp}
          description="This week"
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
          title="Pending Assignments"
          value={stats.assignments}
          change="Due soon"
          changeType="warning"
          icon={Calendar}
          description="Need attention"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyCourses />
        <TodaySchedule />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <RecentActivity />
        <ProgressOverview />
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
  changeType: 'positive' | 'negative' | 'neutral' | 'warning';
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
          <Icon className={`h-8 w-8 mb-2 ${changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' :
              changeType === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
            }`} />
          <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' :
              changeType === 'warning' ? 'text-yellow-600' :
                'text-gray-600'
            }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

function MyCourses() {
  const courses = [
    {
      name: 'Mathematics',
      progress: 75,
      nextLesson: 'Algebra Basics',
      instructor: 'Dr. Smith',
      lastAccessed: '2 hours ago'
    },
    {
      name: 'Physics',
      progress: 60,
      nextLesson: 'Mechanics',
      instructor: 'Prof. Johnson',
      lastAccessed: '1 day ago'
    },
    {
      name: 'Chemistry',
      progress: 45,
      nextLesson: 'Organic Chemistry',
      instructor: 'Dr. Brown',
      lastAccessed: '3 days ago'
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h3>
      <div className="space-y-4">
        {courses.map((course, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{course.name}</h4>
              <span className="text-sm text-gray-500">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Next: {course.nextLesson}</span>
              <span>by {course.instructor}</span>
            </div>
            <div className="mt-2 flex space-x-2">
              <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                <Play className="h-4 w-4 mr-1" />
                Continue
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium">
                <Download className="h-4 w-4 mr-1" />
                Materials
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodaySchedule() {
  const schedule = [
    { time: '09:00 AM', subject: 'Mathematics', instructor: 'Dr. Smith', type: 'Live Class' },
    { time: '11:30 AM', subject: 'Physics', instructor: 'Prof. Johnson', type: 'Assignment Due' },
    { time: '02:00 PM', subject: 'Chemistry', instructor: 'Dr. Brown', type: 'Study Session' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h3>
      <div className="space-y-4">
        {schedule.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="text-center mr-4">
                <p className="text-sm font-medium text-gray-900">{item.time}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.subject}</p>
                <p className="text-sm text-gray-500">by {item.instructor}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'Live Class' ? 'bg-blue-100 text-blue-800' :
                item.type === 'Assignment Due' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                {item.type}
              </span>
              <button className="block mt-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                Join
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
    { title: 'Join Live Class', description: 'Attend scheduled classes', icon: Play },
    { title: 'Download Materials', description: 'Get study resources', icon: Download },
    { title: 'Submit Assignment', description: 'Upload your work', icon: BookOpen },
    { title: 'View Progress', description: 'Check your performance', icon: TrendingUp },
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
    { action: 'Completed Mathematics lesson', time: '2 hours ago' },
    { action: 'Submitted Physics assignment', time: '4 hours ago' },
    { action: 'Downloaded Chemistry notes', time: '1 day ago' },
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
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressOverview() {
  const subjects = [
    { name: 'Mathematics', progress: 75, grade: 'A' },
    { name: 'Physics', progress: 60, grade: 'B+' },
    { name: 'Chemistry', progress: 45, grade: 'B' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{subject.name}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{subject.progress}%</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {subject.grade}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${subject.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
