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

    // Fetch the user's in-game details from the User model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        inGameName: true,
        inGamePlayerId: true,
        role: true, // Assuming role is part of the user model
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

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

    // Add the team creator as a member using their in-game details from the User model
    await prisma.userTeam.create({
      data: {
        userId,
        teamId: newTeam.id,
        inGameName: user.inGameName, // Use the user's in-game name
        inGamePlayerId: user.inGamePlayerId, // Use the user's in-game player ID
        role: user.role || 'Leader', // Use the user's role, default to 'Leader'
      },
    });

    // If there are additional members, fetch their in-game details and add them as well
    if (members && members.length > 0) {
      const memberPromises = members.map(async (member) => {
        const memberDetails = await prisma.user.findUnique({
          where: { id: member.userId },
          select: {
            inGameName: true,
            inGamePlayerId: true,
            role: true,
          },
        });

        if (!memberDetails) {
          throw new Error(`Member with userId ${member.userId} not found`);
        }

        return prisma.userTeam.create({
          data: {
            userId: member.userId,
            teamId: newTeam.id,
            inGameName: memberDetails.inGameName, // Use the member's in-game name
            inGamePlayerId: memberDetails.inGamePlayerId, // Use the member's in-game player ID
            role: memberDetails.role || 'Member', // Use the member's role, default to 'Member'
          },
        });
      });
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