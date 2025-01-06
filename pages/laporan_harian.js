import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/LaporanHarian.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LaporanHarian() {
  const [currentDate, setCurrentDate] = useState('');
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('Selesai');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [dariJam, setDariJam] = useState('');
  const [hinggaJam, setHinggaJam] = useState('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate);

    const userId = localStorage.getItem('userId');

    if (userId) {
      fetch(`/api/laporan_harian?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
          if (data.fullName) {
            setNamaLengkap(data.fullName);
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          toast.error('Gagal mengambil data pengguna');
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const laporanData = {
      namaLengkap,
      tanggalLaporan: currentDate,
      dariJam,
      hinggaJam,
      progressHarian: progress,
      statusHarian: status,
    };

    try {
      const response = await fetch('/api/laporan_harian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(laporanData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Laporan berhasil disimpan!');
        setProgress('');
        setDariJam('');
        setHinggaJam('');
        setStatus('Selesai');
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting laporan:', error);
      toast.error('Terjadi kesalahan saat menyimpan laporan.');
    }
  };

  return (
    <main className={styles.mainContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Laporan Harian Karyawan</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nama Lengkap</label>
            <input
              type="text"
              placeholder="Nama Lengkap"
              className={styles.inputField}
              value={namaLengkap}
              readOnly
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tanggal Laporan</label>
            <input type="date" className={styles.inputField} value={currentDate} readOnly />
          </div>

          <div className={styles.timeGroup}>
            <div className={styles.formGroup}>
              <label>Dari</label>
              <input
                type="time"
                className={styles.inputField}
                value={dariJam}
                onChange={(e) => setDariJam(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Hingga</label>
              <input
                type="time"
                className={styles.inputField}
                value={hinggaJam}
                onChange={(e) => setHinggaJam(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Progres Harian</label>
            <textarea
              placeholder="Masukkan progres harian Anda"
              className={styles.inputField}
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              rows="4"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status Harian</label>
            <select
              className={styles.selectField}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Selesai">Selesai</option>
              <option value="Belum Selesai">Belum Selesai</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <button type="submit" className={styles.uploadButton}>Unggah Laporan</button>
          </div>
        </form>

        <div className={styles.copyright}>
          <a href="https://daikuinterior.com" target="_blank" rel="noopener noreferrer">
            daikuinterior.com © {new Date().getFullYear()}
          </a>
        </div>

        <ToastContainer />
      </div>
    </main>
  );
}