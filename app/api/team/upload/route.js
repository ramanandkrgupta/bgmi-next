import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Important: Disable body parsing for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const filename = 'uploaded_image.png'; // You can use a dynamic filename here
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename); // Ensure the uploads directory exists

    fs.writeFile(filePath, data, (err) => {
      if (err) {
        return res.status(500).json({ error: 'File upload failed' });
      }
      res.status(200).json({ message: 'File uploaded successfully' });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}