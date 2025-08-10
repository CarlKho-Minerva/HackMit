import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadToGCS = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    console.log('📁 Received file:', req.file.originalname, 'Size:', req.file.size);

    // Initialize Google Cloud Storage
    const storage = new Storage({
      keyFilename: process.env.GCS_KEY_FILE, // Path to your service account key file
      projectId: process.env.GCS_PROJECT_ID,
    });

    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({ error: 'GCS bucket name not configured' });
    }

    const bucket = storage.bucket(bucketName);

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `videos/${uuidv4()}.${fileExtension}`;

    // Create a file reference in the bucket
    const file = bucket.file(fileName);

    // Create a write stream
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Handle stream events
    stream.on('error', (error) => {
      console.error('❌ Upload error:', error);
      res.status(500).json({ error: 'Failed to upload to cloud storage' });
    });

    stream.on('finish', async () => {
      try {
        // Make the file publicly readable
        await file.makePublic();

        // Construct the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        console.log('✅ Upload successful:', publicUrl);
        res.json({
          url: publicUrl,
          fileName: fileName,
          originalName: req.file?.originalname,
          size: req.file?.size
        });
      } catch (error) {
        console.error('❌ Error making file public:', error);
        res.status(500).json({ error: 'Failed to make file public' });
      }
    });

    // Write the file buffer to the stream
    stream.end(req.file.buffer);

  } catch (error) {
    console.error('❌ GCS upload error:', error);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
};
