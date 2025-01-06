// pages/api/dashboard.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { userId, role } = req.query;

      if (!userId || Array.isArray(userId)) {
        return res.status(400).json({ error: 'ID pengguna yang valid diperlukan' });
      }

      // Ambil data user
      const user = await prisma.employee.findUnique({
        where: { id: Number(userId) },
        select: { fullName: true }
      });

      // Set tanggal hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Ambil laporan hari ini saja
      const laporanTerbaru = await prisma.laporanHarian.findMany({
        where: {
          ...(role === 'karyawan' ? { namaLengkap: user?.fullName || '' } : {}),
          tanggalLaporan: {
            gte: today,
            lt: tomorrow
          }
        },
        orderBy: [
          { tanggalLaporan: 'desc' },
          { id: 'desc' }
        ]
      });

      // Hitung jumlah karyawan
      const jumlahKaryawan = await prisma.employee.count({
        where: {
          role: 'karyawan'
        }
      });

      // Hitung total pengguna aktif
      const totalPenggunaAktif = await prisma.employee.count();

      // Hitung jumlah laporan hari ini
      const laporanHariIni = await prisma.laporanHarian.count({
        where: {
          tanggalLaporan: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      // Hitung status laporan
      const hitungStatusLaporan = await prisma.laporanHarian.groupBy({
        by: ['statusHarian'],
        _count: {
          statusHarian: true
        }
      });

      // Ambil aktivitas terbaru
      const aktivitasTerbaru = await prisma.userActivity.findMany({
        where: {
          employeeId: Number(userId)
        },
        take: 5,
        orderBy: {
          timestamp: 'desc'
        },
        include: {
          employee: {
            select: {
              fullName: true
            }
          }
        }
      });

      res.status(200).json({
        laporanTerbaru,
        jumlahKaryawan,
        totalPenggunaAktif,
        laporanHariIni,
        hitungStatusLaporan,
        aktivitasTerbaru
      });
    } catch (error) {
      console.error('Error saat mengambil data dashboard:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}