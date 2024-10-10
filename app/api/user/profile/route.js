import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assuming you have Prisma set up
import { verifyToken } from '@/lib/auth'; // Your JWT verification function

// GET method to fetch the user's profile data
export async function GET(request) {
  try {
    // Get the cookies from the request
    const cookies = request.cookies || {};
    const token = cookies.get('token')?.value; // Fetch the JWT token from cookies
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized, no token provided' }, { status: 401 });
    }

    // Verify the token and extract user info
    const decoded = verifyToken(token); // Assuming the token contains userId
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // Fetch the user profile from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        username: true,
        email: true,
        mobile: true,
        depositWallet: true,
        inGamePlayerId: true,  // Fetch inGamePlayerId
        inGameName: true,
        role: true,      // Fetch inGameName
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

// PUT method to update the user's profile data
export async function PUT(request) {
  try {
    // Get the cookies from the request
    const cookies = request.cookies || {};
    const token = cookies.get('token')?.value; // Fetch the JWT token from cookies

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized, no token provided' }, { status: 401 });
    }

    // Verify the token and extract user info
    const decoded = verifyToken(token);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // Parse request body
    const { name, mobile, inGamePlayerId, inGameName, role } = await request.json();  // Include inGamePlayerId and inGameName

    // Update the user profile in the database using Prisma
    const updatedUser = await prisma.user.update({
      where: { email: decoded.email },
      data: {
        name,
        mobile,
        inGamePlayerId,   // Update inGamePlayerId
        inGameName,
        role       // Update inGameName
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}