import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Retrieve cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Fetch teams where the user is a member
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true, // Include user details in the response if needed
          },
        },
      },
    });

    if (!teams || teams.length === 0) {
      return NextResponse.json({ message: 'No teams found for this user' });
    }

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams', details: error.message }, { status: 500 });
  }
}