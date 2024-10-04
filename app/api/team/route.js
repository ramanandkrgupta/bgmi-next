import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// export async function GET(request) {
//   try {
    // Retrieve cookies
    

    // Fetch teams where the user is a member
    // app/api/team/route.js

//     import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

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
  const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
  const { action, teamName, logo,  inGameName, inGamePlayerId, role } = await request.json();
const teamCreatedById = userId;
 const teamCode = Math.random().toString(36).substring(2, 10).toUpperCase(); 
// params.args.data.teamCode = teamCode;

  try {
    if (action === 'create') {
      console.log(teamCode)
      // Create the team
      const team = await prisma.team.create({
        data: {
          teamName,
          logo,
          tournamentId: null,
          teamCreatedById,
          teamCreatedBy: {
            connect: { id: teamCreatedById },
          },
      // Set to null since we don't assign it here
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