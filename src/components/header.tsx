'use client';

import Link from 'next/link';
import MainNav from '@/components/main-nav';
import { UserAccountNav } from '@/components/user-account-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/context/auth-context';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-bold mr-6">
          <h1 className="text-xl">RecTrack</h1>
        </Link>
        {user && <MainNav />}
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          {user && <UserAccountNav />}
        </div>
      </div>
    </header>
  );
};

export default Header;