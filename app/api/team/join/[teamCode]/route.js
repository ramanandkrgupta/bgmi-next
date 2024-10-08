import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken'; // Ensure this library is installed

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey'; // Store this securely

export async function POST(req, { params }) {
  const { teamCode } = params; // Team code from the URL
  const cookieHeader = req.headers.get('cookie');

  // Extract token from cookies
  if (!cookieHeader) {
    return NextResponse.json({ error: 'No cookies found' }, { status: 401 });
  }

  // Find the token in the cookies
  const tokenCookie = cookieHeader.split('; ').find(c => c.startsWith('token='));
  if (!tokenCookie) {
    return NextResponse.json({ error: 'Token not found in cookies' }, { status: 401 });
  }

  const token = tokenCookie.split('=')[1]; // Extract token value

  // Decode and verify the token to get userId
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token with your JWT secret
    userId = decoded.id; // Assuming userId is stored in the token's payload
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }

  try {
    // Find the team based on the team code
    const team = await prisma.team.findUnique({
      where: { teamCode }, // Assuming teamCode is unique in your schema
      include: {
        members: true, // Include members to check if user is already part of the team
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if the user is already a member of the team
    const isAlreadyMember = team.members.some(member => member.userId === userId);
    if (isAlreadyMember) {
      return NextResponse.json({ error: 'User is already a member of this team' }, { status: 400 });
    }

    // Add the user to the team
    await prisma.userTeam.create({
      data: {
        user: {
          connect: { id: userId }, // Connect the user to the team
        },
        team: {
          connect: { id: team.id }, // Connect the team by team ID
        },
        inGameName: 'YourInGameName', // Replace with the actual in-game name
        inGamePlayerId: 'YourPlayerId', // Replace with the actual player ID
       // role: 'Leader', // Assuming the team creator is the leader
        role: 'Member', // Assuming you have roles in the team (e.g., Member, Leader)
      },
    });

    return NextResponse.json({ message: 'Successfully joined the team' }, { status: 200 });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json({ error: 'Failed to join team', details: error.message }, { status: 500 });
  }
}