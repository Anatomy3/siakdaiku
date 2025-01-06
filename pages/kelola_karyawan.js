import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/KelolaKaryawan.module.css';
import { FaEllipsisV, FaEnvelope, FaWhatsapp, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function KelolaKaryawan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedEmployeeReports, setSelectedEmployeeReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    fullName: '',
    email: '',
    department: '',
    password: '',
    whatsapp: '',
    role: 'karyawan',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/kelola_karyawan');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
    }
  };

  const handleReportClick = async (employee) => {
    setLoadingReports(true);
    try {
      const response = await fetch(`/api/kelola_karyawan?namaLengkap=${encodeURIComponent(employee.fullName)}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setSelectedEmployeeReports(data);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAddNewEmployee = async () => {
    if (!newEmployee.username || !newEmployee.password || !newEmployee.fullName || !newEmployee.role) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('username', newEmployee.username);
    formData.append('fullName', newEmployee.fullName);
    formData.append('email', newEmployee.email);
    formData.append('divisi', newEmployee.department);
    formData.append('password', newEmployee.password);
    formData.append('whatsapp', newEmployee.whatsapp);
    formData.append('role', newEmployee.role);
    if (photo) formData.append('photo', photo);

    try {
      const response = await fetch('/api/kelola_karyawan', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { newEmployee: addedEmployee } = await response.json();
        setEmployees([...employees, addedEmployee]);
        setIsAdding(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        console.error('Failed to save employee:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (employee) => {
    setIsEditing(true);
    setIsAdding(true);
    setCurrentEmployee(employee);
    setNewEmployee({
      username: employee.username,
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      password: '',
      whatsapp: employee.whatsapp,
      role: employee.role || 'karyawan',
    });
    setPhotoPreview(employee.photo || '/daiku/profile.png');
  };

  const handleSaveEdit = async () => {
    if (!currentEmployee || !currentEmployee.id) {
      console.error('ID karyawan tidak ditemukan');
      return;
    }

    const formData = new FormData();
    formData.append('username', newEmployee.username);
    formData.append('fullName', newEmployee.fullName);
    formData.append('email', newEmployee.email);
    formData.append('divisi', newEmployee.department);
    if (newEmployee.password) formData.append('password', newEmployee.password);
    formData.append('whatsapp', newEmployee.whatsapp);
    formData.append('role', newEmployee.role);
    if (photo) formData.append('photo', photo);

    try {
      const response = await fetch(`/api/kelola_karyawan/${currentEmployee.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedEmployees = employees.map((emp) =>
          emp.id === currentEmployee.id
            ? { ...newEmployee, id: currentEmployee.id, photo: photoPreview || '/daiku/profile.png' }
            : emp
        );
        setEmployees(updatedEmployees);
        setIsEditing(false);
        setIsAdding(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        console.error('Failed to save employee:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm('Apakah Anda yakin ingin menghapus karyawan ini?');
    if (confirmed) {
      try {
        const response = await fetch(`/api/kelola_karyawan/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setEmployees(employees.filter((employee) => employee.id !== id));
        } else {
          console.error('Failed to delete employee');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setNewEmployee({
      username: '',
      fullName: '',
      email: '',
      department: '',
      password: '',
      whatsapp: '',
      role: 'karyawan',
    });
    setPhoto(null);
    setPhotoPreview(null);
  };

  return (
    <main className={styles.mainContent}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Kelola Karyawan</h1>
          <button
            className={styles.addButton}
            onClick={() => {
              setIsAdding(!isAdding);
              setIsEditing(false);
            }}
          >
            {isAdding ? 'Tutup' : '+ Tambah Karyawan'}
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Cari karyawan..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.employeeCards}>
          {employees.length > 0 ? (
            employees
              .filter((employee) =>
                employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((employee) => (
                <div key={employee.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <img
                      src={employee.photo || '/daiku/profile.png'}
                      alt={employee.fullName}
                      className={styles.employeePhoto}
                    />
                    <div className={styles.employeeInfo}>
                      <p className={styles.employeeName}>{employee.fullName}</p>
                      <p className={styles.department}>{employee.department}</p>
                    </div>
                    <div className={styles.hamburgerMenu}>
                      <button
                        onClick={() =>
                          setIsMenuOpen(isMenuOpen === employee.id ? null : employee.id)
                        }
                        className={styles.hamburgerIcon}
                      >
                        <FaEllipsisV />
                      </button>
                      {isMenuOpen === employee.id && (
                        <div className={styles.menu}>
                          <button onClick={() => handleEdit(employee)}>Edit</button>
                          <button onClick={() => handleDelete(employee.id)}>Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.contactInfo}>
                    <p>
                      <FaEnvelope className={styles.icon} />
                      <span>{employee.email || '-'}</span>
                    </p>
                    <p>
                      <FaWhatsapp className={styles.icon} />
                      <span>{employee.whatsapp || '-'}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleReportClick(employee)}
                    className={styles.reportButton}
                  >
                    Lihat Laporan Harian
                  </button>
                </div>
              ))
          ) : (
            <p style={{ textAlign: 'center' }}>Tidak ada data karyawan.</p>
          )}
        </div>

        {(isAdding || isEditing) && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button
                className={styles.modalCloseButton}
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  resetForm();
                }}
              >
                &times;
              </button>
              <h2>{isEditing ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h2>
              <div className={styles.formGroup}>
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  name="fullName"
                  value={newEmployee.fullName}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Foto (Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className={styles.inputField}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className={styles.photoPreview}
                  />
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={newEmployee.username}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Password</label>
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newEmployee.password}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  name="role"
                  value={newEmployee.role}
                  onChange={handleInputChange}
                  className={styles.inputField}
                >
                  <option value="karyawan">Karyawan</option>
                  <option value="admin">Admin</option>
                  <option value="karyawan dan admin">Karyawan dan Admin</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Divisi</label>
                <input
                  type="text"
                  name="divisi"
                  value={newEmployee.department}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nomor WhatsApp</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={newEmployee.whatsapp}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>
              <button
                className={styles.addButton}
                onClick={isEditing ? handleSaveEdit : handleAddNewEmployee}
              >
                {isEditing ? 'Simpan' : 'Selesai'}
              </button>
            </div>
          </div>
        )}

        {showReportModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowReportModal(false)}
              >
                &times;
              </button>
              <h2>Laporan Karyawan</h2>
              {loadingReports ? (
                <div className={styles.loading}>Memuat laporan...</div>
              ) : selectedEmployeeReports.length > 0 ? (
                <div className={styles.reportTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Jam Kerja</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmployeeReports.map((report) => (
                        <tr key={report.id}>
                          <td>{new Date(report.tanggalLaporan).toLocaleDateString()}</td>
                          <td>{report.dariJam} - {report.hinggaJam}</td>
                          <td>{report.progressHarian}</td>
                          <td>{report.statusHarian}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Tidak ada laporan untuk karyawan ini.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}