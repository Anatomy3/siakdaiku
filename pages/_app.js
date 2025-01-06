import { useState, useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Layout.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication from localStorage
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId);
  }, []);

  // For login page
  if (router.pathname === '/login') {
    return (
      <>
        <Head>
          <title>Login - Daiku Interior</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="description" content="Login Sistem Manajemen Laporan Daiku Interior" />
          <meta name="theme-color" content="#4CAF50" />
          <link rel="icon" href="/daiku/logo.png" />
        </Head>
        <Component {...pageProps} />
        <ToastContainer />
      </>
    );
  }

  // Default layout with sidebar for authenticated pages
  return (
    <>
      <Head>
        <title>Daiku Interior</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="Sistem Manajemen Laporan Daiku Interior" />
        <meta name="theme-color" content="#4CAF50" />
        <link rel="icon" href="/daiku/logo.png" />
      </Head>

      {isAuthenticated ? (
        <div className={styles.layout}>
          <Sidebar />
          <main className={styles.mainContent}>
            <Component {...pageProps} />
          </main>
        </div>
      ) : null}
      
      <ToastContainer />
    </>
  );
}

export default MyApp;