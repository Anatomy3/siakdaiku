import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Profile.module.css';
import { FaEnvelope, FaWhatsapp, FaUser, FaBuilding, FaLock, FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Profile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('/daiku/profile.png');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    department: '',
    whatsapp: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID tidak ditemukan');
      }
      const response = await fetch('/api/profile', {
        headers: {
          'user-id': userId
        }
      });
      if (!response.ok) {
        throw new Error('Gagal mengambil data karyawan');
      }
      const data = await response.json();
      setEmployee(data);
      setNewEmployee({
        fullName: data.fullName || '',
        email: data.email || '',
        department: data.department || '',
        whatsapp: data.whatsapp || '',
        username: data.username || '',
        password: '',
      });
      setPhotoPreview(data.photo || '/daiku/profile.png');
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSaveEdit = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID tidak ditemukan');
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui profil');
      }

      const updatedData = await response.json();
      setEmployee(updatedData.employee);
      setNewEmployee(prev => ({
        ...prev,
        ...updatedData.employee,
        password: ''
      }));
      toast.success('Profil berhasil diperbarui!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setShowCredentialsModal(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <main className={styles.mainContent}>
      <Navbar />
      <div className={styles.profileWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.photoSection}>
            <img src={photoPreview} alt="Profile" className={styles.profilePhoto} />
            <label htmlFor="photo-upload" className={styles.photoUploadButton}>
              Ubah
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className={styles.hiddenInput}
            />
          </div>
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label><FaUser /> Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={newEmployee.fullName}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label><FaBuilding /> Departemen</label>
              <input
                type="text"
                name="department"
                value={newEmployee.department}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label><FaEnvelope /> Email</label>
              <input
                type="email"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label><FaWhatsapp /> Nomor WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                value={newEmployee.whatsapp}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <button className={styles.changeCredentialsButton} onClick={() => setShowCredentialsModal(true)}>
              Ubah Username/Password
            </button>
            <button className={styles.saveButton} onClick={handleSaveEdit}>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
      {showCredentialsModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Ubah Username/Password</h2>
            <div className={styles.formGroup}>
              <label><FaUserCircle /> Username</label>
              <input
                type="text"
                name="username"
                value={newEmployee.username}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label><FaLock /> Password</label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={newEmployee.password}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  placeholder="Masukkan password baru"
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
            <div className={styles.modalButtons}>
              <button className={styles.saveButton} onClick={handleSaveEdit}>Simpan</button>
              <button className={styles.cancelButton} onClick={() => setShowCredentialsModal(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </main>
  );
}