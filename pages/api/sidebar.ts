import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getUserProfile(req, res);
    default:
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}

async function getUserProfile(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: Number(userId) },
      select: {
        fullName: true,
        department: true,
        photo: true,
        role: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Fetch dashboard data
    const [laporanKaryawan, aktivitasTerbaru] = await Promise.all([
      prisma.laporanHarian.findMany({
        orderBy: { tanggalLaporan: 'desc' },
        take: 5,
      }),
      prisma.userActivity.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5,
        include: { employee: true },
      }),
    ]);

    const jumlahKaryawan = await prisma.employee.count();

    const hariIni = new Date().toDateString();
    const laporanHariIni = laporanKaryawan.filter(
      laporan => new Date(laporan.tanggalLaporan).toDateString() === hariIni
    ).length;

    return res.status(200).json({
      userProfile: {
        fullName: employee.fullName || 'User Name',
        department: employee.department || 'Magang',
        photo: employee.photo || '/daiku/profile.png',
        role: employee.role || 'karyawan',
      },
      dashboardData: {
        laporanKaryawan,
        aktivitasTerbaru,
        jumlahKaryawan,
        laporanHariIni,
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}