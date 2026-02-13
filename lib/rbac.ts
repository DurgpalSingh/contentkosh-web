import { User } from '@/lib/api';
import { ROUTES, USER_ROLES } from '@/lib/constants';
import {
    Home,
    Users,
    BookOpen,
    Calendar,
    Bell,
    Settings,
    ClipboardList,
    GraduationCap,
    LucideIcon,
    FileText,
} from 'lucide-react';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    roles?: UserRole[];
    permissions?: string[]; // Code of the permission required
}



export const NAVIGATION_CONFIG: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: Home,
        // Accessible to everyone by default if no roles/permissions specified
    },
    // Admin specific
    {
        name: 'Users',
        href: ROUTES.ADMIN.USERS,
        icon: Users,
        roles: [USER_ROLES.ADMIN],
    },
    {
        name: 'Announcements',
        href: ROUTES.ADMIN.ANNOUNCEMENTS,
        icon: Bell,
        roles: [USER_ROLES.ADMIN],
    },

    // Teacher View
    {
        name: 'My Classes',
        href: ROUTES.TEACHER.CLASSES,
        icon: BookOpen,
        roles: [USER_ROLES.TEACHER],
    },
    {
        name: 'Announcements',
        href: ROUTES.TEACHER.ANNOUNCEMENTS,
        icon: Bell,
        roles: [USER_ROLES.TEACHER],
    },

    // Student View
    {
        name: 'My Classes',
        href: ROUTES.STUDENT.CLASSES,
        icon: BookOpen,
        roles: [USER_ROLES.STUDENT],
    },
    {
        name: 'Announcements',
        href: ROUTES.STUDENT.ANNOUNCEMENTS,
        icon: Bell,
        roles: [USER_ROLES.STUDENT],
    },

    // Common items
    {
        name: 'Exams',
        href: '/dashboard/exams',
        icon: ClipboardList,
        roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
    },
    {
        name: 'Courses',
        href: '/dashboard/courses',
        icon: BookOpen,
        roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
    },
    {
        name: 'Batches',
        href: '/dashboard/batches',
        icon: Calendar,
        roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
    },
    {
        name: 'Batch Details',
        href: '/dashboard/batches/details',
        icon: GraduationCap,
        roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
    },
    {
        name: 'Content',
        href: '/dashboard/contents',
        icon: FileText,
        roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT],
    },
    {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        // Everyone has settings, but content might differ
    },
];

/**
 * Checks if a user has a specific role.
 * Considers role inheritance if applicable, but for now exact match.
 */
export function hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    // Cast user to any to access role property safely as it might be missing in type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (user as any).role;
    if (!userRole) return false;
    return userRole.toString().toUpperCase() === role.toUpperCase();
}

/**
 * Checks if a user has a specific permission.
 */
export function hasPermission(userPermissions: string[], permission: string): boolean {
    return userPermissions.includes(permission);
}

/**
 * Filters navigation items based on user's role and permissions.
 */
export function getNavigationItems(
    user: User | null,
    userPermissions: string[]
): NavigationItem[] {
    if (!user) return [];

    return NAVIGATION_CONFIG.filter((item) => {
        // 1. Check Role
        if (item.roles && item.roles.length > 0) {
            // Check if ANY of the roles match (case insensitive handled by hasRole)
            const hasMatch = item.roles.some(r => hasRole(user, r));
            if (!hasMatch) return false;
        }

        // 2. Check Permission
        if (item.permissions && item.permissions.length > 0) {
            // If permissions are undefined (e.g. not fetched yet), treat as empty
            const currentPermissions = userPermissions || [];
            if (currentPermissions.length === 0) {
                return false;
            }
            const hasAllPermissions = item.permissions.every((p) =>
                hasPermission(currentPermissions, p)
            );
            if (!hasAllPermissions) {
                return false;
            }
        }

        return true;
    });
}
