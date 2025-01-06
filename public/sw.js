// public/sw.js

self.addEventListener('push', function(event) {
    const options = {
      body: event.data.text(),
      icon: '/daiku/logo.png',
      badge: '/daiku/logo.png',
      vibrate: [200, 100, 200]
    };
  
    event.waitUntil(
      self.registration.showNotification('Daiku Notification', options)
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/')
    );
  });