'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {

    const protectedPaths = ['/calendar', '/dashboard', '/roadmap', '/community', '/profile', '/settings'];
    const guestPaths = ['/login', '/register', '/forgot-password', '/']; 

    const token = localStorage.getItem('token');

    if (token && guestPaths.includes(pathname)) {
      router.push('/dashboard');
      return; 
    }

    if (!token && protectedPaths.includes(pathname)) {
      router.push('/login');
      return;
    }
    setIsAuthorized(true);
    
  }, [router, pathname]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}