'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, ShieldCheck, Building2 } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const NAVIGATION = [
  { name: 'Businesses', href: ROUTES.SUPERADMIN.BUSINESSES, icon: Building2 },
];

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.LOGIN);
  };

  const isActiveLink = (href: string) => pathname?.startsWith(href);

  const Brand = () => (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-100 to-blue-100">
        <ShieldCheck className="h-5 w-5 text-indigo-600" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">Super Admin</p>
      </div>
    </div>
  );

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 space-y-1 px-3 py-6">
      {NAVIGATION.map((item) => {
        const active = isActiveLink(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              active ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  const UserSection = () => (
    <div className="border-t border-slate-200 p-4 bg-slate-50/50">
      <div className="flex items-center p-2 rounded-lg">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
          <User className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="ml-3 min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">{user?.name || 'Super Admin'}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="mt-3 w-full justify-start px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-red-600"
        onClick={handleLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col overflow-y-auto bg-indigo-50">
          <div className="flex h-16 items-center justify-between px-5 bg-white border-b border-indigo-100 shadow-sm">
            <Brand />
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <NavLinks onNavigate={() => setSidebarOpen(false)} />
          <UserSection />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow overflow-y-auto bg-indigo-50 border-r border-indigo-100">
          <div className="flex h-16 items-center px-4 border-b border-indigo-100 bg-white sticky top-0 z-10">
            <Brand />
          </div>
          <NavLinks />
          <UserSection />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
