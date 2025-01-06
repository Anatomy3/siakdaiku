// pages/api/projek.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const projects = await prisma.proyek.findMany({
          orderBy: {
            createdAt: 'asc'
          }
        });
        return res.status(200).json({ data: projects });

      case 'POST':
        const newProject = await prisma.proyek.create({
          data: {
            project: req.body.project || 'Proyek Baru',
            status: req.body.status || 'draft',
            bulan1: '',
            bulan2: '',
            bulan3: '',
            bulan4: '',
            bulan5: '',
            bulan6: '',
            bulan7: '',
            bulan8: '',
            bulan9: '',
            bulan10: '',
            bulan11: '',
            bulan12: ''
          },
        });
        return res.status(201).json(newProject);

      case 'PUT':
        const { id } = req.query;
        const projectData = req.body;

        const updatedProject = await prisma.proyek.update({
          where: { id: Number(id) },
          data: {
            project: projectData.project,
            bulan1: projectData.bulan1 || '',
            bulan2: projectData.bulan2 || '',
            bulan3: projectData.bulan3 || '',
            bulan4: projectData.bulan4 || '',
            bulan5: projectData.bulan5 || '',
            bulan6: projectData.bulan6 || '',
            bulan7: projectData.bulan7 || '',
            bulan8: projectData.bulan8 || '',
            bulan9: projectData.bulan9 || '',
            bulan10: projectData.bulan10 || '',
            bulan11: projectData.bulan11 || '',
            bulan12: projectData.bulan12 || '',
            status: projectData.status || 'draft',
            updatedAt: new Date()
          },
        });
        return res.status(200).json(updatedProject);

      case 'DELETE':
        const deleteId = req.query.id;
        await prisma.proyek.delete({
          where: { id: Number(deleteId) }
        });
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  } finally {
    await prisma.$disconnect();
  }
}