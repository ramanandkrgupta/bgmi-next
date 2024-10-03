import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET Request for Fetching Team Details
export async function GET(request, { params }) {
  const teamCode = params.teamCode; // This should be a string

  // Log for debugging to verify it's a string
  console.log('Fetching details for team code:', teamCode); // Should output a string, not an array

  try {
    const team = await prisma.team.findUnique({
      where: {
        teamCode: teamCode, // Using teamCode directly
      },
      include: {
        members: {
          select: { // Change from include to select
            id: true,
            userId: true,
            teamId: true,
            inGameName: true,
            inGamePlayerId: true,
            role: true,
            // Don't include user information here
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json({ error: 'Failed to fetch team details', details: error.message }, { status: 500 });
  }
}