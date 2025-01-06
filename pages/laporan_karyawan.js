// pages/laporan_karyawan.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/LaporanKaryawan.module.css';

export default function LaporanKaryawan() {
  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user role and name from localStorage
    const role = localStorage.getItem('userRole');
    const fullName = localStorage.getItem('fullName');
    setUserRole(role);
    setUserName(fullName);
    fetchLaporan(role, fullName);
  }, []);

  const fetchLaporan = async (role, fullName) => {
    try {
      const response = await fetch('/api/laporan_karyawan');
      const data = await response.json();
      if (Array.isArray(data)) {
        // If user is not admin, filter laporan to show only their own
        if (role !== 'admin' && role !== 'karyawan dan admin') {
          const filteredData = data.filter(item => item.namaLengkap === fullName);
          setLaporan(filteredData);
        } else {
          setLaporan(data);
        }
      } else {
        setLaporan([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching laporan:', error);
      setLaporan([]);
      setIsLoading(false);
    }
  };

  const groupLaporanByDate = (laporan) => {
    const grouped = {};
    laporan.forEach(item => {
      const date = new Date(item.tanggalLaporan);
      const dateString = date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(item);
    });
    return grouped;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterToggle = () => {
    setFilterVisible(!filterVisible);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // For admin, allow searching through all reports
  // For karyawan, searchTerm is ignored since they only see their own reports
  const filteredLaporan = laporan.filter((laporan) => {
    const matchesSearch = userRole === 'admin' || userRole === 'karyawan dan admin' 
      ? laporan.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesStatus = filterStatus
      ? laporan.statusHarian === filterStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <main className={styles.mainContainer}>
      <Navbar />
      <div className={`${styles.content} ${isMobile ? styles.mobileContent : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {userRole === 'admin' || userRole === 'karyawan dan admin' 
              ? 'Laporan Harian Karyawan'
              : 'Riwayat Laporan Anda'}
          </h1>
          <button className={styles.filterButton} onClick={handleFilterToggle}>
            Filter
          </button>
        </div>

        {filterVisible && (
          <div className={styles.filterOptions}>
            <label>Status Laporan</label>
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={handleFilterStatusChange}
            >
              <option value="">Semua</option>
              <option value="Selesai">Selesai</option>
              <option value="Belum Selesai">Belum Selesai</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>
        )}

        {/* Only show search for admin */}
        {(userRole === 'admin' || userRole === 'karyawan dan admin') && (
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari karyawan..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        )}

        <div className={styles.laporanTable}>
          {isLoading ? (
            <p>Memuat laporan...</p>
          ) : filteredLaporan.length > 0 ? (
            Object.entries(groupLaporanByDate(filteredLaporan)).map(([date, items]) => (
              <div key={date} className={styles.dateGroup}>
                <div className={styles.dateDivider}>
                  <span className={styles.dateLabel}>{date}</span>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Nama Lengkap</th>
                        <th>Jam Kerja</th>
                        <th>Progres Harian</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((laporan) => (
                        <tr key={laporan.id}>
                          <td>{laporan.namaLengkap}</td>
                          <td>{laporan.dariJam} - {laporan.hinggaJam}</td>
                          <td>{laporan.progressHarian}</td>
                          <td>{laporan.statusHarian}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p>Tidak ada laporan yang ditemukan.</p>
          )}
        </div>
        
        <div className={styles.copyright}>
          <a href="https://daikuinterior.com" target="_blank" rel="noopener noreferrer">
            daikuinterior.com © {new Date().getFullYear()}
          </a>
        </div>
      </div>
    </main>
  );
}