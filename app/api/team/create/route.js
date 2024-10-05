import { PrismaClient } from '@prisma/client'; // Import Prisma Client
import { nanoid } from 'nanoid'; // Import nanoid for generating unique team codes
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient(); // Initialize Prisma Client

export async function POST(req) {
  try {
    const { teamName, logoUrl, members } = await req.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Default logo path
    const defaultLogoUrl = '/logo/bgmi-logo.jpeg'; // Ensure the logo path is correct

    // Use the provided logo URL or fall back to the default logo
    const teamLogo = logoUrl || defaultLogoUrl;

    // Generate a unique team code
    const teamCode = nanoid(8); // Generates a unique 8-character string

    // Create the team in the database
    const newTeam = await prisma.team.create({
      data: {
        teamName,
        logo: teamLogo,
        teamCode,
        teamCreatedBy: { connect: { id: userId } },
      },
    });

    // Add the team creator as a member
    await prisma.userTeam.create({
      data: {
        userId,
        teamId: newTeam.id,
        inGameName: 'YourInGameName', // Replace with the actual in-game name
        inGamePlayerId: 'YourPlayerId', // Replace with the actual player ID
        role: 'Leader', // Assuming the team creator is the leader
      },
    });

    // If there are additional members, add them as well
    if (members && members.length > 0) {
      const memberPromises = members.map((member) =>
        prisma.userTeam.create({
          data: {
            userId: member.userId,
            teamId: newTeam.id,
            inGameName: member.inGameName,
            inGamePlayerId: member.inGamePlayerId,
            role: member.role,
          },
        })
      );
      await Promise.all(memberPromises);
    }

    return new Response(JSON.stringify(newTeam), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return new Response(JSON.stringify({ error: 'Error creating team', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect(); // Ensure Prisma Client is disconnected after the operation
  }
}