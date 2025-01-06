import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { namaLengkap, tanggalLaporan, dariJam, hinggaJam, progressHarian, statusHarian } = req.body;

    try {
      const waktuPengiriman = new Date();
      const formattedTime = waktuPengiriman.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const laporan = await prisma.laporanHarian.create({
        data: {
          namaLengkap,
          tanggalLaporan: new Date(tanggalLaporan),
          dariJam,
          hinggaJam,
          progressHarian,
          statusHarian,
          waktuPengiriman,
        },
      });

      res.status(200).json({
        message: 'Laporan berhasil disimpan',
        laporan,
        waktuTerkirim: formattedTime,
      });
    } catch (error) {
      console.error('Error submitting laporan:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan laporan.' });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;

    if (userId) {
      try {
        const user = await prisma.employee.findUnique({
          where: { id: parseInt(userId as string) },
          select: { fullName: true }
        });

        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      try {
        const laporanHarian = await prisma.laporanHarian.findMany({
          orderBy: {
            tanggalLaporan: 'desc',
          },
        });
        res.status(200).json(laporanHarian);
      } catch (error) {
        console.error('Error fetching laporan harian:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil laporan.' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}