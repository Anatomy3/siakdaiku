import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  console.log(`Method: ${req.method}, ID: ${id}`);

  // Validasi jika ID tidak ditemukan atau tidak valid
  if (req.method === 'PUT' || req.method === 'DELETE') {
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID karyawan tidak valid' });
    }
  }

  // Mengambil laporan karyawan berdasarkan nama
  if (req.method === 'GET' && req.query.namaLengkap) {
    try {
      const { namaLengkap } = req.query;

      const laporan = await prisma.laporanHarian.findMany({
        where: {
          namaLengkap: String(namaLengkap)
        },
        orderBy: {
          tanggalLaporan: 'desc'
        }
      });

      return res.status(200).json(laporan);
    } catch (error) {
      console.error('Error fetching employee reports:', error);
      return res.status(500).json({ error: 'Error fetching employee reports' });
    }
  }

  // Operasi POST untuk menambahkan karyawan
  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: path.join(process.cwd(), '/public/uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const { username, fullName, email, department, password, whatsapp, role } = fields;
      const photo = Array.isArray(files.photo)
        ? files.photo[0]?.filepath
        : (files.photo && (files.photo as formidable.File).filepath) || null;

      if (!username || !password || !fullName || !role) {
        return res.status(400).json({ error: 'Username, password, fullName, dan role wajib diisi.' });
      }

      try {
        const existingEmployee = await prisma.employee.findUnique({
          where: { username: String(username) },
        });

        if (existingEmployee) {
          return res.status(400).json({ error: 'Karyawan sudah ada' });
        }

        const hashedPassword = await bcrypt.hash(String(password), 10);
        let photoUrl = '/daiku/profile.png';

        if (photo) {
          const newFilename = `${Date.now()}_${path.basename(photo)}`;
          const newFilePath = path.join(path.join(process.cwd(), '/public/uploads'), newFilename);
          fs.renameSync(photo, newFilePath);
          photoUrl = `/uploads/${newFilename}`;
        }

        const newEmployee = await prisma.employee.create({
          data: {
            username: String(username),
            fullName: String(fullName),
            email: email ? String(email) : null,
            department: department ? String(department) : null,
            password: hashedPassword,
            whatsapp: whatsapp ? String(whatsapp) : null,
            photo: photoUrl,
            role: String(role),
          },
        });

        console.log('Employee created:', newEmployee);
        return res.status(200).json({ newEmployee });
      } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).json({ error: 'Error creating employee' });
      }
    });
  }

  // Operasi GET untuk mengambil semua karyawan
  else if (req.method === 'GET') {
    try {
      const employees = await prisma.employee.findMany();
      return res.status(200).json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ error: 'Error fetching employees' });
    }
  }

  // Operasi PUT untuk mengupdate karyawan
  else if (req.method === 'PUT') {
    const form = formidable({
      uploadDir: path.join(process.cwd(), '/public/uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const { username, fullName, email, department, password, whatsapp, role } = fields;
      const photo = Array.isArray(files.photo)
        ? files.photo[0]?.filepath
        : (files.photo && (files.photo as formidable.File).filepath) || null;

      try {
        const existingEmployee = await prisma.employee.findUnique({
          where: { id: Number(id) },
        });

        if (!existingEmployee) {
          return res.status(404).json({ error: 'Karyawan tidak ditemukan' });
        }

        let updatedPassword = existingEmployee.password;
        if (password) {
          updatedPassword = await bcrypt.hash(String(password), 10);
        }

        let photoUrl = existingEmployee.photo;
        if (photo) {
          const newFilename = `${Date.now()}_${path.basename(photo)}`;
          const newFilePath = path.join(path.join(process.cwd(), '/public/uploads'), newFilename);
          fs.renameSync(photo, newFilePath);
          photoUrl = `/uploads/${newFilename}`;
        }

        const updatedEmployee = await prisma.employee.update({
          where: { id: Number(id) },
          data: {
            username: String(username),
            fullName: String(fullName),
            email: email ? String(email) : null,
            department: department ? String(department) : null,
            password: updatedPassword,
            whatsapp: whatsapp ? String(whatsapp) : null,
            photo: photoUrl,
            role: String(role),
          },
        });

        console.log('Employee updated:', updatedEmployee);
        return res.status(200).json(updatedEmployee);
      } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ error: 'Error updating employee' });
      }
    });
  }

  // Operasi DELETE untuk menghapus karyawan
  else if (req.method === 'DELETE') {
    try {
      const deletedEmployee = await prisma.employee.delete({
        where: { id: Number(id) },
      });

      console.log('Employee deleted:', deletedEmployee);
      return res.status(200).json({ message: 'Karyawan berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      return res.status(500).json({ error: 'Error deleting employee' });
    }
  }

  // Method tidak didukung
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}