import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['user-id'];

  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ message: 'User ID tidak valid' });
  }

  if (req.method === 'GET') {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(userId) },
        select: {
          fullName: true,
          email: true,
          department: true,
          whatsapp: true,
          username: true,
          photo: true
        }
      });

      if (employee) {
        res.status(200).json(employee);
      } else {
        res.status(404).json({ message: 'Karyawan tidak ditemukan' });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data karyawan' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { fullName, email, department, whatsapp, photo, username, password } = req.body;

      let updateData: any = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (email !== undefined) updateData.email = email;
      if (department !== undefined) updateData.department = department;
      if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
      if (photo !== undefined) updateData.photo = photo;
      if (username !== undefined) updateData.username = username;

      if (password && password !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      const updatedEmployee = await prisma.employee.update({
        where: { id: parseInt(userId) },
        data: updateData,
        select: {
          fullName: true,
          email: true,
          department: true,
          whatsapp: true,
          username: true,
          photo: true
        }
      });

      res.status(200).json({ message: 'Profil berhasil diperbarui', employee: updatedEmployee });
    } catch (error) {
      console.error('Error updating employee profile:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui profil' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}