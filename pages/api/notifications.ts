import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type NotificationRequest = {
  message: string;
  recipientType: 'all' | 'department' | 'individual';
  recipient?: string;
  sender?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: {
          timestamp: 'desc'
        },
        take: 50 // Batasi 50 notifikasi terbaru
      });
      
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Gagal mengambil notifikasi' });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const { message, recipientType, recipient, sender } = req.body as NotificationRequest;
      
      // Validasi input
      if (!message || !recipientType) {
        return res.status(400).json({ error: 'Pesan dan tipe penerima harus diisi' });
      }

      // Jika recipientType bukan 'all', recipient harus diisi
      if (recipientType !== 'all' && !recipient) {
        return res.status(400).json({ error: 'Penerima harus dipilih' });
      }

      const newNotification = await prisma.notification.create({
        data: {
          message,
          recipientType,
          recipient: recipient || null,
          sender: sender || 'Admin',
          status: 'sent',
          timestamp: new Date()
        }
      });
      
      res.status(201).json(newNotification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Gagal membuat notifikasi' });
    }
  }
  
  // Endpoint untuk menandai notifikasi sebagai dibaca
  else if (req.method === 'PATCH') {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'ID notifikasi diperlukan' });
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: Number(id) },
        data: { status: 'read' }
      });

      res.status(200).json(updatedNotification);
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: 'Gagal memperbarui status notifikasi' });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}