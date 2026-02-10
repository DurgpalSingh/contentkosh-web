'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/lib/constants';
import { getNavigationItems } from '@/lib/rbac';
import {
  Menu,
  X,
  User,
  LogOut,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, business, logout, permissions } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Dynamically rewrite navigation URLs if business slug is present
  const navigation = getNavigationItems(user, permissions).map(item => {
    if (business?.slug && item.href.startsWith('/dashboard')) {
      // Replace /dashboard with /:slug/dashboard
      // Careful: if item.href is exactly /dashboard, replace with /slug/dashboard
      // if item.href is /dashboard/batches, replace with /slug/dashboard/batches
      const newItem = { ...item };
      newItem.href = item.href.replace('/dashboard', `/${business.slug}/dashboard`);
      return newItem;
    }
    return item;
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getDisplayName = () => {
    return business?.instituteName || 'Contentkosh';
  };

  const isActiveLink = (href: string) => {
    // If slug is present, href will be /slug/dashboard...
    if (href.endsWith('/dashboard') || href === `/${business?.slug}/dashboard`) {
      return pathname === href;
    }
    // For nested routes
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-blue-50">
          <div className="flex h-16 items-center justify-between px-4 border-b border-blue-100 bg-white">
            <h1 className="text-xl font-bold text-slate-900">{getDisplayName()}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${active
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-blue-100 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-4 w-full justify-start px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-blue-50 border-r border-blue-100">
          <div className="flex h-16 items-center px-5 bg-white border-b border-blue-100 shadow-sm z-10">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getDisplayName()}</h1>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {navigation.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${active
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-default">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-3 w-full justify-start px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-red-600 hover:shadow-sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            {/* Current Page Title Placeholder or Breadcrumb could go here */}
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500">
              <Bell className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-8 bg-white/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}