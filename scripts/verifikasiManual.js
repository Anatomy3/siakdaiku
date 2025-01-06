const bcrypt = require('bcrypt');

const hashedPassword = '<hash yang baru dihasilkan>'; // Gunakan hash baru dari rehashPassword.js
const inputPassword = 'lingga1234'.trim(); // Pastikan tidak ada karakter tersembunyi

console.log('Password yang diuji:', inputPassword);
console.log('Hash yang diuji:', hashedPassword);

bcrypt.compare(inputPassword, hashedPassword, (err, result) => {
  if (err) {
    console.error(err);
  } else if (result) {
    console.log('Password matches!');
  } else {
    console.log('Password does not match.');
  }
});
