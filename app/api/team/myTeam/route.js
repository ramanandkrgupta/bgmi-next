import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have your Prisma client initialized here
import { verifyToken } from '@/lib/auth'; // Assuming you have a function to verify JWT

export async function GET(request) {
  try {
    // Get the cookies from the request
    const cookies = request.cookies;
    const token = cookies.get('token'); // Fetch the JWT token from cookies

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized, no token provided' }, { status: 401 });
    }

    // Verify the token and extract user info
    const decoded = verifyToken(token.value); // Assuming the token contains userId
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token, no userId' }, { status: 403 });
    }

    // Fetch all teams created by the current user
    const teams = await prisma.team.findMany({
      where: {
        teamCreatedById: userId, // Find teams where this user is the creator
      },
      include: {
        members: true, // Include team members
        teamCreatedBy: { // Include the user who created the team
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!teams || teams.length === 0) {
      return NextResponse.json({ message: 'No teams found for this user' }, { status: 404 });
    }

    // Return all the teams created by the user
    return NextResponse.json({ teams }, { status: 200 });

  } catch (error) {
    console.error('Error fetching teams info:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}