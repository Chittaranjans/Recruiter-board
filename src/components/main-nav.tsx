'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const MainNav = () => {
  const pathname = usePathname();
  const { isRecruiter, isAdmin , isCandidate , user , isInterviewer } = useAuth();
  
  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard',
      visible: true,
    },
    {
      href: '/dashboard/jobs',
      label: 'Jobs',
      active: pathname.startsWith('/dashboard/jobs'),
      visible: true,
    },
    {
      href: '/dashboard/candidates',
      label: 'Candidates',
      active: pathname.startsWith('/dashboard/candidates'),
      visible: !isCandidate(),
    },
    {
      href: '/dashboard/kanban',
      label: 'Kanban',
      active: pathname.startsWith('/dashboard/kanban'),
      visible: !isCandidate(),
    },
    {
      href: '/dashboard/interviews',
      label: 'Interviews',
      active: pathname.startsWith('/dashboard/interviews'),
      visible: true,
    },
    {
      href: '/dashboard/interviews/schedule',
      label: 'Schedule Interview',
      active: pathname === '/dashboard/interviews/schedule',
      visible: isRecruiter() || isInterviewer(), // Both roles can schedule
    },
    {
      href: '/dashboard/users',
      label: 'Users',
      active: pathname.startsWith('/dashboard/users'),
      visible: isAdmin(), // Call the function with ()
    },
  ];

  return (
    <nav className="flex items-center space-x-6 lg:space-x-6">
      {routes
        .filter((route) => route.visible)
        .map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              route.active ? 'text-black dark:text-white' : 'text-muted-foreground'
            )}
          >
            {route.label}
          </Link>
        ))}
    </nav>
  );
};

export default MainNav;