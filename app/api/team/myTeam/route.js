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

    // Fetch the team information for the current user
    const team = await prisma.team.findFirst({
      where: {
        teamCreatedById:  userId, // Find the team where this user is a member
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

    if (!team) {
      return NextResponse.json({ message: 'No team found for this user' }, { status: 404 });
    }

    // Return the team information
    return NextResponse.json({ team }, { status: 200 });

  } catch (error) {
    console.error('Error fetching team info:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}