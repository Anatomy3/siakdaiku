import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable body parsing karena kita menggunakan formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Operasi DELETE untuk menghapus karyawan
  if (req.method === 'DELETE') {
    if (!id) {
      res.status(400).json({ error: 'ID karyawan diperlukan untuk menghapus' });
      return;
    }

    try {
      // Menghapus karyawan berdasarkan id dari tabel Employee
      const deletedEmployee = await prisma.employee.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({ message: 'Karyawan berhasil dihapus' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting employee' });
    }
  }

  // Operasi PUT untuk mengupdate karyawan (dengan id)
  else if (req.method === 'PUT') {
    const form = formidable({
      uploadDir: path.join(process.cwd(), '/public/uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing form data' });
        return;
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
            email: String(email),
            department: String(department),
            password: updatedPassword,
            whatsapp: String(whatsapp),
            photo: photoUrl,
            role: String(role),
          },
        });

        res.status(200).json(updatedEmployee);
      } catch (error) {
        res.status(500).json({ error: 'Error updating employee' });
      }
    });
  }

  // Jika method tidak didukung
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
