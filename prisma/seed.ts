import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tambahkan logika seeding di sini
  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })