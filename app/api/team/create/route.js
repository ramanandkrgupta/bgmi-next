import formidable from 'formidable';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

export async function POST(req) {
  const cookies = req.cookies;
  const token = cookies.get('token');

  if (!token) {
    console.error('No token provided');
    return NextResponse.json({ error: 'Unauthorized, no token provided' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = verifyToken(token.value); // Verify the token and decode it
  } catch (err) {
    console.error('Error verifying token:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const userId = decoded.id;

  if (!userId) {
    console.error('No userId found in token');
    return NextResponse.json({ error: 'Invalid token, no userId' }, { status: 403 });
  }

  // Create a new instance of Formidable
  const form = new formidable.IncomingForm();

  // Parse the incoming request with formidable
  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the files:', err);
        reject(NextResponse.json({ error: 'Error parsing the files' }, { status: 500 }));
        return;
      }

      console.log('Parsed fields:', fields); // Log parsed fields
      console.log('Parsed files:', files);   // Log parsed files

      const { teamName } = fields;

      if (!teamName) {
        console.error('Team name is missing');
        reject(NextResponse.json({ error: 'Team name is required' }, { status: 400 }));
        return;
      }

      const file = files.teamLogo;

      if (!file || file.length === 0) {
        console.error('Team logo file is missing');
        reject(NextResponse.json({ error: 'Team logo is required' }, { status: 400 }));
        return;
      }

      // Define the upload directory
      const uploadDir = path.join(process.cwd(), 'public');

      // Move the file to the public folder
      const newFileName = `${Date.now()}-${file[0].originalFilename}`;
      const filePath = path.join(uploadDir, newFileName);

      // Use fs to rename the file
      fs.rename(file[0].filepath, filePath, (error) => {
        if (error) {
          console.error('Error saving the file:', error);
          reject(NextResponse.json({ error: 'Error saving the file' }, { status: 500 }));
          return;
        }

        // Construct the image URL
        const imageUrl = `/${newFileName}`;

        const team = {
          teamName,
          logo: imageUrl,
          teamCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Example team code
          teamCreatedById: userId,
          members: [
            {
              userId,
              inGameName: 'AcePlayer', // Replace with actual in-game name
              inGamePlayerId: 'player123', // Replace with actual in-game player ID
              role: 'Leader', // Replace with actual role
            },
          ],
        };

        console.log('Team created successfully:', team); // Log the created team details
        resolve(NextResponse.json(team, { status: 200 })); // Send team details in response
      });
    });
  });
}