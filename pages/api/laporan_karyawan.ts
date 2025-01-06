import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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
  // Menangani request POST untuk menambahkan laporan harian
  else if (req.method === 'POST') {
    try {
      const { namaLengkap, tanggalLaporan, dariJam, hinggaJam, progressHarian, statusHarian } = req.body;

      const newLaporan = await prisma.laporanHarian.create({
        data: {
          namaLengkap,
          tanggalLaporan: new Date(tanggalLaporan),
          dariJam,
          hinggaJam,
          progressHarian,
          statusHarian,
        },
      });

      res.status(201).json(newLaporan);
    } catch (error) {
      console.error('Error creating laporan harian:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat membuat laporan.' });
    }
  } 
  // Jika metode HTTP lain digunakan
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
