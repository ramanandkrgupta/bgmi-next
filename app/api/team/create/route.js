// app/api/team/create/route.js

import { PrismaClient } from '@prisma/client'; // Import Prisma Client
import { nanoid } from 'nanoid'; // Import nanoid for generating unique team codes

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient(); // Initialize Prisma Client


// prisma.$use(async (params, next) => {
//     // Check if this is a 'create' operation for the 'User' model
//     if (params.action === 'create') {
//       // Generate a random referral code (you can customize the length)
//       const teamCode = Math.random().toString(36).substring(2, 10).toUpperCase(); 
//       params.args.data.teamCode = teamCode;
//     }
  
//     return next(params);
//   });

export async function POST(req) {
  try {
    const { teamName, logoUrl} = await req.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    const teamCreatedById = userId;
    console.log(userId)

    // Default logo path
    const defaultLogoUrl = '/logo/bgmi-logo.jpeg'; // Ensure the logo path is correct

    // Use the provided logo URL or fall back to the default logo
    const teamLogo = logoUrl ? logoUrl : defaultLogoUrl;

    // Generate a unique team code
     const teamCode = nanoid(8); // Generates a unique 8-character string

    // Create the team in the database
    const newTeam = await prisma.team.create({
      data: {
        teamName,
        logo: teamLogo,
        teamCode,
        // teamCreatedById: userId,
        teamCreatedBy: {
          connect: { id: teamCreatedById }, // Associate with the user who created the team
        },
      },
    });

    return new Response(JSON.stringify(newTeam), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return new Response(JSON.stringify({ error: 'Error creating team', errorindetail: error}), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    await prisma.$disconnect(); // Ensure Prisma Client is disconnected after the operation
  }
}