import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to generate teamCode
prisma.$use(async (params, next) => {
  // Check if this is a 'create' operation for the 'User' model
  if (params.model === 'Team' && params.action === 'create') {
    // Generate a random referral code (you can customize the length)
    const teamCode = Math.random().toString(36).substring(2, 10).toUpperCase(); 
    params.args.data.teamCode = teamCode;
  }

  return next(params);
});
// Unified POST Request for Creating or Joining a Team
export async function POST(request) {
  const { action, teamName, logo, userId, inGameName, inGamePlayerId, role, teamCode } = await request.json();

  try {
    if (action === 'create') {
      // Create Team Logic
      

      // Create the team
      const team = await prisma.team.create({
        data: {
          teamName,
          logo,
          tournamentId: null, // Set to null since we don't assign it here
          members: {
            create: [
              {
                user: {
                  connect: { id: userId },
                },
                inGameName,
                inGamePlayerId,
                role,
              },
            ],
          },
          teamCode: teamCode, // Store the generated team code
        },
      });

      return NextResponse.json({ message: 'Team created successfully', team });
    } else if (action === 'join') {
      // Join Team Logic
      // Find the team by team code
      const team = await prisma.team.findUnique({
        where: {
          teamCode,
        },
      });

      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      // Add the user to the team
      const updatedTeam = await prisma.team.update({
        where: { id: team.id },
        data: {
          members: {
            create: {
              user: {
                connect: { id: userId },
              },
              inGameName,
              inGamePlayerId,
              role,
            },
          },
        },
      });

      return NextResponse.json({ message: 'User joined the team successfully', team: updatedTeam });
    } else {
      return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing team request:', error);
    return NextResponse.json({ error: 'Failed to process team request', details: error.message }, { status: 500 });
  }
}
