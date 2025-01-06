import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`
    res.status(200).json({ message: "Database connected successfully", result })
  } catch (error) {
    console.error("Database connection error:", error)
    res.status(500).json({ message: "Failed to connect to database", error: (error as Error).message })
  } finally {
    await prisma.$disconnect()
  }
}