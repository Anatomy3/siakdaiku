// pages/api/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    // Hapus semua cookies
    res.setHeader('Set-Cookie', [
      'userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
      'userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
      'fullName=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    ]);

    // Catat aktivitas logout jika ada userId
    if (userId) {
      const user = await prisma.employee.findUnique({
        where: { id: Number(userId) },
      });

      if (user) {
        await prisma.userActivity.create({
          data: {
            employeeId: user.id,
            description: `${user.fullName || user.username} melakukan logout`
          }
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}