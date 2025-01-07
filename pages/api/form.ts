// pages/api/form.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

// Buat folder uploads jika belum ada
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          await downloadFile(req, res);
        } else {
          await getFiles(req, res);
        }
        break;
      case 'POST':
        await uploadFile(req, res);
        break;
      case 'DELETE':
        await deleteFile(req, res);
        break;
      default:
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all files
async function getFiles(req: NextApiRequest, res: NextApiResponse) {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        employee: true // Include employee data
      }
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
}

// Download file
async function downloadFile(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const document = await prisma.document.findUnique({
      where: { id: Number(id) }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), document.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get file extension
    const ext = path.extname(document.name).toLowerCase();
    
    // Set appropriate MIME type
    let contentType = 'application/octet-stream';
    if (['.doc', '.docx'].includes(ext)) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (['.xls', '.xlsx'].includes(ext)) {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    const fileStream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(document.name)}`);
    
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
}

// Upload file
async function uploadFile(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = path.extname(file.originalFilename || '').toLowerCase();
    const newFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const newPath = path.join(uploadDir, newFileName);

    // Move file
    await fs.promises.rename(file.filepath, newPath);

    // Get employee ID from request headers or session
    const employeeId = 1; // Replace with actual employee ID from auth

    // Determine file type
    const type = ['.doc', '.docx'].includes(ext) ? 'word' : 
                ['.xls', '.xlsx'].includes(ext) ? 'excel' : 
                'other';

    // Save to database
    const document = await prisma.document.create({
      data: {
        name: file.originalFilename || newFileName,
        type,
        filePath: `public/uploads/${newFileName}`,
        uploadedBy: employeeId // Use the employee ID
      },
      include: {
        employee: true // Include employee data in response
      }
    });

    res.status(200).json({ 
      message: 'File uploaded successfully',
      document 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
}

// Delete file
async function deleteFile(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const document = await prisma.document.findUnique({
      where: { id: Number(id) }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file
    const filePath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
}
