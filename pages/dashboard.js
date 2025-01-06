// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [peran, setPeran] = useState('');
  const [idPengguna, setIdPengguna] = useState('');
  const [laporan, setLaporan] = useState([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [aktivitas, setAktivitas] = useState([]);
  const [jumlahKaryawan, setJumlahKaryawan] = useState(0);
  const [totalPenggunaAktif, setTotalPenggunaAktif] = useState(0);
  const [hitungStatusLaporan, setHitungStatusLaporan] = useState({});
  const [laporanHariIni, setLaporanHariIni] = useState(0);
  const [error, setError] = useState(null);
  const [dataReady, setDataReady] = useState(false);

  // Cek autentikasi dan set data awal
  useEffect(() => {
    const initializeData = () => {
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      if (!userId) {
        router.push('/login');
        return;
      }

      setPeran(userRole || '');
      setIdPengguna(userId || '');
      setDataReady(true);
    };

    initializeData();
  }, []);

  // Ambil data dashboard setelah autentikasi berhasil
  useEffect(() => {
    const ambilData = async () => {
      if (!dataReady || !idPengguna || !peran) return;
      
      setSedangMemuat(true);
      setError(null);
      
      try {
        const responDashboard = await fetch(`/api/dashboard?userId=${idPengguna}&role=${peran}`);
        
        if (!responDashboard.ok) {
          throw new Error('Gagal mengambil data');
        }
        
        const dataDashboard = await responDashboard.json();
        
        setLaporan(dataDashboard.laporanTerbaru || []);
        setAktivitas(dataDashboard.aktivitasTerbaru || []);
        setJumlahKaryawan(dataDashboard.jumlahKaryawan || 0);
        setTotalPenggunaAktif(dataDashboard.totalPenggunaAktif || 0);
        setLaporanHariIni(dataDashboard.laporanHariIni || 0);
        setHitungStatusLaporan(dataDashboard.hitungStatusLaporan || {});
      } catch (error) {
        console.error('Error saat mengambil data:', error);
        setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.');
      } finally {
        setSedangMemuat(false);
      }
    };

    if (dataReady && idPengguna && peran) {
      ambilData();
      const interval = setInterval(ambilData, 30000);
      return () => clearInterval(interval);
    }
  }, [dataReady, idPengguna, peran]);

  const renderDashboard = () => (
    <div className={styles.kontenDashboard}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.barisUtama}>
        <div className={styles.kartuLaporan}>
          <div className={styles.headerKartu}>
            <div className={styles.headerLeft}>
              <h3>Laporan Harian Karyawan</h3>
              <div className={styles.tanggalDanIndikator}>
                <span className={styles.tanggalHariIni}>
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <div className={styles.indikatorHariIni}>
                  <span className={styles.titikHariIni}></span>
                  <span>Hari ini</span>
                </div>
              </div>
            </div>
            {peran === 'karyawan' && (
              <button 
                onClick={() => router.push('/laporan_harian')}
                className={styles.tombolBuatLaporan}
              >
                Buat Laporan!
              </button>
            )}
          </div>
          {sedangMemuat ? (
            <p>Memuat laporan...</p>
          ) : laporan.length > 0 ? (
            <div className={styles.pembungkusTabel}>
              <table className={styles.tabel}>
                <thead>
                  <tr>
                    <th>Nama Lengkap</th>
                    <th>Jam Kerja</th>
                    <th>Progres Harian</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.map((itemLaporan) => (
                    <tr key={itemLaporan.id}>
                      <td>{itemLaporan.namaLengkap}</td>
                      <td>{`${itemLaporan.dariJam} - ${itemLaporan.hinggaJam}`}</td>
                      <td>{itemLaporan.progressHarian}</td>
                      <td>{itemLaporan.statusHarian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Tidak ada laporan yang ditemukan untuk hari ini.</p>
          )}
        </div>
        <div className={styles.barisKartu}>
          <div className={styles.kartu}>
            <h3>Status Laporan Harian</h3>
            {sedangMemuat ? (
              <p>Memuat status...</p>
            ) : (
              <div className={styles.statusLaporan}>
                <span className={styles.jumlahLaporan}>{laporanHariIni}/{jumlahKaryawan}</span>
                <span className={styles.deskripsiLaporan}>karyawan telah melaporkan</span>
              </div>
            )}
          </div>
          <div className={styles.kartu}>
            <h3>Total Pengguna Aktif</h3>
            {sedangMemuat ? (
              <p>Memuat data...</p>
            ) : (
              <div className={styles.jumlahPengguna}>{totalPenggunaAktif}</div>
            )}
          </div>
          <div className={styles.kartu}>
            <h3>Riwayat Aktivitas</h3>
            {sedangMemuat ? (
              <p>Memuat aktivitas...</p>
            ) : aktivitas.length > 0 ? (
              <ul className={styles.daftarAktivitas}>
                {aktivitas.map((aktivitas, indeks) => (
                  <li key={indeks} className={styles.itemAktivitas}>
                    <div className={styles.barAktivitas}></div>
                    <div className={styles.kontenAktivitas}>
                      <div className={styles.judulAktivitas}>{aktivitas.description}</div>
                      <div className={styles.waktuAktivitas}>
                        {new Date(aktivitas.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Belum ada aktivitas terbaru.</p>
            )}
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <a href="https://daikuinterior.com" target="_blank" rel="noopener noreferrer">
          daikuinterior.com © {new Date().getFullYear()}
        </a>
      </div>
    </div>
  );

  // Tampilkan loading jika data belum siap
  if (!dataReady) {
    return (
      <main className={styles.kontenUtama}>
        <Navbar />
        <div className={styles.kontenDashboard}>
          <p>Memuat data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.kontenUtama}>
      <Navbar />
      {renderDashboard()}
    </main>
  );
}