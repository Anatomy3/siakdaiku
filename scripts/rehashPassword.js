const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function rehashPassword() {
  const plainPassword = 'lingga1234';
  const hashedPassword = await bcrypt.hash(plainPassword, 10); // Gunakan 10 salt rounds


  console.log('Hashed password:', hashedPassword); // Tampilkan hash yang baru

  // Update password untuk user 'lingga123'
  await prisma.user.update({
    where: { username: 'lingga123' },
    data: { password: hashedPassword },
  });

  console.log('Password has been rehashed and updated in the database.');
}

rehashPassword()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
