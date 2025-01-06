import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      // Jika sudah login, redirect ke dashboard
      router.replace('/dashboard');
    } else {
      // Jika belum login, redirect ke login
      router.replace('/login');
    }
  }, []);

  return null;
}