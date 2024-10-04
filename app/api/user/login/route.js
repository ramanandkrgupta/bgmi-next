import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey'; // You should store this in a secure environment variable

export async function POST(req, res) {
  const { email, password } = await req.json();

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // If user does not exist, return error
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
      });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    // Set the JWT token as a cookie (HttpOnly, Secure)
    const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure=${process.env.NODE_ENV === 'production'}`;

    // Return response with cookie set
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie, // Set the JWT as a cookie
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Login failed', details: error.message }),
      {
        status: 500,
      }
    );
  }
}