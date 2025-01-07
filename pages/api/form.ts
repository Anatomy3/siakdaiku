// pages/api/form.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request`);
  
  switch (req.method) {
    case 'GET':
      if (req.query.id) {
        await getDocumentContent(req, res);
      } else {
        await getDocuments(req, res);
      }
      break;
    case 'POST':
      await uploadDocument(req, res);
      break;
    case 'DELETE':
      await deleteDocument(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getDocuments(req: NextApiRequest, res: NextApiResponse) {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ 
      message: 'Error fetching documents', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function getDocumentContent(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get the correct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', path.basename(document.filePath));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return res.status(404).json({ message: 'File is empty' });
    }

    // Set appropriate headers
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Type', getMimeType(document.name));
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.name)}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ 
      message: 'Error serving document', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function uploadDocument(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  form.parse(req, async (err, fields, files: any) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error uploading file', error: err.message });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Generate unique filename and move file
      const fileExt = path.extname(file.originalFilename || '');
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExt}`;
      const finalPath = path.join(uploadDir, uniqueFilename);
      
      fs.renameSync(file.filepath, finalPath);

      // Determine document type
      const type = fileExt.toLowerCase();
      const documentType = 
        ['.doc', '.docx'].includes(type) ? 'word' :
        ['.xls', '.xlsx'].includes(type) ? 'excel' : 
        'other';

      // Save to database
      const document = await prisma.document.create({
        data: {
          name: file.originalFilename || 'Unnamed',
          type: documentType,
          filePath: `public/uploads/${uniqueFilename}`,
          uploadedBy: 1, // Replace with actual user ID
        },
      });

      res.status(200).json({ 
        message: 'File uploaded successfully', 
        document 
      });
    } catch (error) {
      console.error('Error saving document:', error);
      // Clean up file if database save fails
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      res.status(500).json({ 
        message: 'Error saving document', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}

async function deleteDocument(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file
    const filePath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      message: 'Error deleting document', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
