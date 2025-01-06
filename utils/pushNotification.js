// utils/pushNotification.js

export async function initializePushNotifications() {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return;
    }
  
    try {
      let permission = await Notification.requestPermission();
      if (permission === 'granted') {
        registerServiceWorker();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }
  
  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered');
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }
  
  export function sendPushNotification(title, body) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/daiku/logo.png', // Sesuaikan dengan path logo Anda
        badge: '/daiku/logo.png',
        vibrate: [200, 100, 200]
      });
    }
  }