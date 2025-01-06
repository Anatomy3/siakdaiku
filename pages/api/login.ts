// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', username);

      const user = await prisma.employee.findUnique({
        where: { username },
      });

      if (!user) {
        return res.status(401).json({ message: 'Username tidak ditemukan' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        // Set cookies with longer expiration and correct flags
        res.setHeader('Set-Cookie', [
          `userId=${user.id}; Path=/; SameSite=Lax; Max-Age=86400`,
          `userRole=${user.role}; Path=/; SameSite=Lax; Max-Age=86400`,
          `fullName=${user.fullName}; Path=/; SameSite=Lax; Max-Age=86400`
        ]);

        // Record login activity
        await prisma.userActivity.create({
          data: {
            employeeId: user.id,
            description: `${user.fullName || user.username} melakukan login`
          }
        });

        return res.status(200).json({
          success: true,
          userId: user.id,
          role: user.role,
          fullName: user.fullName
        });
      } else {
        return res.status(401).json({ message: 'Password salah' });
      }

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }

  return res.status(405).json({ message: 'Method tidak diizinkan' });
}