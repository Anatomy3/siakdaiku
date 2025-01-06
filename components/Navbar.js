// components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaUsers, FaUser, FaPaperPlane, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from '../styles/Navbar.module.css';
import 'react-toastify/dist/ReactToastify.css';

export default function Navbar() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);

    if (userRole === 'admin') {
      fetchEmployeesAndDepartments();
    }
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchEmployeesAndDepartments = async () => {
    try {
      const response = await fetch('/api/kelola_karyawan');
      if (!response.ok) {
        throw new Error('Gagal mengambil data karyawan');
      }
      const data = await response.json();
      
      const validEmployees = data.filter(emp => emp.fullName);
      setEmployees(validEmployees);
      
      const uniqueDepartments = [...new Set(data
        .filter(emp => emp.department)
        .map(emp => emp.department))];
      setDepartments(uniqueDepartments);
      
      if (validEmployees.length > 0) {
        setSelectedEmployee(validEmployees[0].id.toString());
      }
      if (uniqueDepartments.length > 0) {
        setSelectedDepartment(uniqueDepartments[0]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengambil data karyawan');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Gagal mengambil notifikasi');
      }
      const data = await response.json();
      setNotifications(data);

      const userId = localStorage.getItem('userId');
      const unread = data.filter(notif => 
        notif.status === 'sent' && 
        (notif.recipientType === 'all' || 
         (notif.recipientType === 'individual' && notif.recipient === userId) ||
         (notif.recipientType === 'department' && notif.recipient === localStorage.getItem('department')))
      ).length;
      
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengambil notifikasi');
    }
  };

  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast.warning('Pesan tidak boleh kosong');
      return;
    }

    if (recipientType !== 'all' && recipientType === 'individual' && !selectedEmployee) {
      toast.warning('Pilih karyawan terlebih dahulu');
      return;
    }

    if (recipientType !== 'all' && recipientType === 'department' && !selectedDepartment) {
      toast.warning('Pilih departemen terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const senderName = localStorage.getItem('fullName') || 'Admin';
      
      const notificationData = {
        message,
        recipientType,
        recipient: recipientType === 'all' ? 'all' : 
                   recipientType === 'department' ? selectedDepartment :
                   selectedEmployee,
        sender: senderName
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim notifikasi');
      }

      setMessage('');
      await fetchNotifications();
      toast.success('Notifikasi berhasil dikirim');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengirim notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const handleReadNotification = async (id) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui status notifikasi');
      }

      await fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal memperbarui status notifikasi');
    }
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.iconContainer}>
        <div className={styles.notificationIcon} onClick={toggleNotification}>
          <FaBell />
          {unreadCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {isNotificationOpen && (
        <div ref={notificationRef} className={styles.notificationPanel}>
          <div className={styles.notificationHeader}>
            <h3>Notifikasi Sistem</h3>
            <FaTimes className={styles.closeIcon} onClick={() => setIsNotificationOpen(false)} />
          </div>

          <div className={styles.notificationContent}>
            {notifications.length > 0 ? (
              <div className={styles.notificationList}>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`${styles.notificationItem} ${notification.status === 'sent' ? styles.unread : ''}`}
                    onClick={() => handleReadNotification(notification.id)}
                  >
                    <div className={styles.notificationMeta}>
                      <span className={styles.notificationTime}>
                        {new Date(notification.timestamp).toLocaleString('id-ID')}
                      </span>
                      {notification.sender && (
                        <span className={styles.notificationSender}>
                          dari {notification.sender}
                        </span>
                      )}
                    </div>
                    <div className={styles.notificationMessage}>
                      {notification.message}
                    </div>
                    <div className={styles.notificationStatus}>
                      {notification.status === 'sent' && <span className={styles.statusSent}>Terkirim</span>}
                      {notification.status === 'delivered' && <span className={styles.statusDelivered}>Tersampaikan</span>}
                      {notification.status === 'read' && <span className={styles.statusRead}>Dibaca</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noNotifications}>Tidak ada notifikasi saat ini.</p>
            )}
          </div>

          {role === 'admin' && (
            <div className={styles.adminSection}>
              <div className={styles.messageInput}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik pesan notifikasi..."
                  disabled={loading}
                />
                <div className={styles.recipientSelector}>
                  <div className={styles.recipientButtons}>
                    <button
                      className={`${styles.recipientButton} ${recipientType === 'all' ? styles.active : ''}`}
                      onClick={() => setRecipientType('all')}
                      disabled={loading}
                    >
                      <FaUsers /> Semua
                    </button>
                    <button
                      className={`${styles.recipientButton} ${recipientType === 'department' ? styles.active : ''}`}
                      onClick={() => setRecipientType('department')}
                      disabled={loading}
                    >
                      <FaFilter /> Departemen
                    </button>
                    <button
                      className={`${styles.recipientButton} ${recipientType === 'individual' ? styles.active : ''}`}
                      onClick={() => setRecipientType('individual')}
                      disabled={loading}
                    >
                      <FaUser /> Karyawan
                    </button>
                  </div>

                  {recipientType === 'department' && departments.length > 0 && (
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className={styles.selectRecipient}
                      disabled={loading}
                    >
                      <option value="">Pilih Departemen</option>
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>{dept}</option>
                      ))}
                    </select>
                  )}

                  {recipientType === 'individual' && employees.length > 0 && (
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className={styles.selectRecipient}
                      disabled={loading}
                    >
                      <option value="">Pilih Karyawan</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} {emp.department ? `- ${emp.department}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button 
                  className={styles.sendButton}
                  onClick={handleSendNotification}
                  disabled={loading || !message.trim()}
                >
                  <FaPaperPlane /> {loading ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}