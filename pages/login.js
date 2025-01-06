// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userId = document.cookie.includes('userId=');
    if (userId) {
      router.push('/dashboard');
      return;
    }

    // Load saved credentials if remember me was checked
    if (rememberMe) {
      const savedUsername = localStorage.getItem('savedUsername');
      const savedPassword = localStorage.getItem('savedPassword');
      if (savedUsername) setUsername(savedUsername);
      if (savedPassword) setPassword(savedPassword);
    }
  }, [rememberMe, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('savedUsername', username);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('savedPassword');
        }

        // Store user info in both localStorage and cookies
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('fullName', data.fullName);
        localStorage.setItem('department', data.department);

        // Set cookies with 7 days expiration
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `userId=${data.userId}; path=/; expires=${expires}`;
        document.cookie = `userRole=${data.role}; path=/; expires=${expires}`;

        // Redirect ke dashboard dan refresh setelah 100ms
        router.push('/dashboard').then(() => {
          setTimeout(() => {
            window.location.reload();
          }, 100);
        });
      } else {
        alert(data.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Terjadi kesalahan saat login. Silakan coba lagi.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#FFFFFF"
            fillOpacity="1"
            d="M0,160L60,170.7C120,181,240,203,360,218.7C480,235,600,245,720,229.3C840,213,960,171,1080,160C1200,149,1320,171,1380,181.3L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </svg>
      </div>

      <div className={styles.logoContainer}>
        <img 
          src="/daiku/logodaiku.png"
          alt="Daiku Logo"
          className={styles.logo}
          onError={(e) => {
            console.error('Error loading logo:', e);
            e.target.src = '/daiku/logo.png';
            e.target.onerror = () => {
              e.target.style.display = 'none';
            };
          }}
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Masuk ke akun Anda</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Nama Pengguna</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan nama pengguna"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Kata Sandi</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className={styles.input}
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className={styles.eyeButton}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.flexContainer}>
            <div>
              <input
                type="checkbox"
                id="remember"
                className={styles.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className={styles.rememberLabel}>
                Ingat saya
              </label>
            </div>
          </div>
          
          <button type="submit" className={styles.loginBtn}>
            Masuk
          </button>
        </form>
      </div>

      <div className={styles.footer}>
        <Link 
          href="https://daikuinterior.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          daikuinterior.com © {new Date().getFullYear()}
        </Link>
      </div>
    </div>
  );
}