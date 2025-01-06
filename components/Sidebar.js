// components/Sidebar.js
import { useState, useEffect, useRef } from 'react';
import { FaRegCalendarAlt, FaUser, FaSignOutAlt, FaBars, FaMoneyCheckAlt, FaProjectDiagram } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [role, setRole] = useState('');
  const [profileName, setProfileName] = useState('Memuat...');
  const [profileImage, setProfileImage] = useState('/daiku/profile.png');
  const [profileDepartment, setProfileDepartment] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);

    if (storedUserId) {
      fetchUserData(storedUserId);
    } else {
      window.location.replace('/login');
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`/api/sidebar?userId=${userId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileName(data.userProfile.fullName || 'N/A');
        setProfileDepartment(data.userProfile.department || '');
        setProfileImage(data.userProfile.photo || '/daiku/profile.png');
        setRole(data.userProfile.role || '');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfileName('Error loading data');
      setProfileDepartment('');
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      if (isMobile) setIsSidebarOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [isMobile, router.events]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }

    if (isMobile && isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      const userId = localStorage.getItem('userId');
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      localStorage.clear();
      sessionStorage.clear();
      
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }

      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      sessionStorage.clear();
      
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
      
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateToPage = (path) => {
    router.push(path);
  };

  const isActive = (path) => {
    return router.pathname === path ? styles.active : '';
  };

  const menuItems = role === 'admin' ? [
    { path: '/dashboard', icon: <MdDashboard className={styles.icon} />, label: 'DASHBOARD' },
    { path: '/laporan_karyawan', icon: <FaRegCalendarAlt className={styles.icon} />, label: 'LAPORAN KARYAWAN' },
    { path: '/kelola_karyawan', icon: <FaUser className={styles.icon} />, label: 'KELOLA KARYAWAN' },
    { path: '/form', icon: <FaMoneyCheckAlt className={styles.icon} />, label: 'FORM' },
    { path: '/projek', icon: <FaProjectDiagram className={styles.icon} />, label: 'PROJEK' },
  ] : [
    { path: '/dashboard', icon: <MdDashboard className={styles.icon} />, label: 'DASHBOARD' },
    { path: '/laporan_harian', icon: <FaRegCalendarAlt className={styles.icon} />, label: 'BUAT LAPORAN' },
    { path: '/laporan_karyawan', icon: <FaRegCalendarAlt className={styles.icon} />, label: 'RIWAYAT LAPORAN' },
    { path: '/form', icon: <FaMoneyCheckAlt className={styles.icon} />, label: 'FORM' },
    { path: '/projek', icon: <FaProjectDiagram className={styles.icon} />, label: 'PROJEK' },
  ];

  return (
    <>
      {isMobile && (
        <button className={styles.hamburger} onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}

      <div ref={sidebarRef} className={`${styles.sidebar} ${isMobile && !isSidebarOpen ? styles.closed : styles.open}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.logoContainer}>
            <img src="/daiku/logo.png" alt="Daiku Logo" className={styles.logo} />
            <span className={styles.logoText}>daiku</span>
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileImageWrapper}>
              <img 
                src={profileImage} 
                alt="Profile" 
                className={styles.profileImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/daiku/profile.png';
                }}
              />
            </div>

            <div className={styles.nameContainer}>
              <h2 className={styles.profileName}>{profileName}</h2>
            </div>
            <p className={styles.profileJob}>{profileDepartment}</p>
          </div>

          <div className={styles.divider}></div>

          <nav className={styles.sidebarNav}>
            <ul>
              {menuItems.map((item, index) => (
                <li key={index} className={`${isActive(item.path)}`}>
                  <a onClick={() => navigateToPage(item.path)}>
                    {item.icon} {item.label}
                  </a>
                </li>
              ))}
              <li className={`${isActive('/profile')}`}>
                <a onClick={() => navigateToPage('/profile')}>
                  <FaUser className={styles.icon} /> PROFILE
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.logoutSection}>
          <a onClick={handleLogout} style={{ pointerEvents: isLoggingOut ? 'none' : 'auto' }}>
            <FaSignOutAlt className={styles.icon} />
            <span>KELUAR</span>
          </a>
        </div>
      </div>
    </>
  );
}