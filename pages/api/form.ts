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
    console.log("Fetching all documents");
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log(`Found ${documents.length} documents`);
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function getDocumentContent(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    console.log(`Fetching content for document id: ${id}`);
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
    });
    if (!document) {
      console.log(`Document with id ${id} not found in database`);
      return res.status(404).json({ message: 'Document not found in database' });
    }
    
    console.log(`Document found in database: ${JSON.stringify(document)}`);
    const filePath = path.join(process.cwd(), document.filePath);
    console.log(`Full file path: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found on server: ${filePath}`);
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes`);
    
    if (stats.size === 0) {
      console.log(`File is empty: ${filePath}`);
      return res.status(404).json({ message: 'File is empty' });
    }
    
    const fileExtension = path.extname(document.name).toLowerCase();
    let contentType = 'application/octet-stream';
    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (fileExtension === '.docx' || fileExtension === '.doc') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(document.name)}`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error fetching document content:', error);
    res.status(500).json({ message: 'Error fetching document content', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function uploadDocument(req: NextApiRequest, res: NextApiResponse) {
  console.log("Starting upload process");
  const form = new IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  form.parse(req, async (err, fields, files: any) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error uploading file', error: err.message });
    }

    console.log("Files received:", files);
    const file = files.file?.[0];
    if (!file) {
      console.log("No file received in the request");
      return res.status(400).json({ message: 'Missing file' });
    }

    console.log("File path:", file.filepath);

    try {
      const relativeFilePath = path.relative(process.cwd(), file.filepath);
      const fileExtension = path.extname(file.originalFilename || '').toLowerCase();
      const type = fileExtension === '.docx' || fileExtension === '.doc' ? 'word' : 
                   fileExtension === '.xlsx' || fileExtension === '.xls' ? 'excel' : 'other';

      console.log("Creating document in database");
      const document = await prisma.document.create({
        data: {
          name: file.originalFilename || 'Unnamed',
          type: type,
          filePath: relativeFilePath,
          uploadedBy: 1, // Replace with actual employee ID or get from session
        },
      });

      console.log("Document created successfully:", document);
      res.status(200).json({ message: 'File uploaded successfully', document });
    } catch (error) {
      console.error('Error saving to database:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: 'Error saving file information', error: error.message, stack: error.stack });
      } else {
        res.status(500).json({ message: 'Error saving file information', error: 'Unknown error' });
      }
    }
  });
}

async function deleteDocument(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    console.log(`Deleting document with id: ${id}`);
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({
      where: { id: Number(id) },
    });

    console.log("Document deleted successfully");
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}