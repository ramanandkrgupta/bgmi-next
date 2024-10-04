import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Middleware to generate referralCode
prisma.$use(async (params, next) => {
  // Check if this is a 'create' operation for the 'User' model
  if (params.model === 'User' && params.action === 'create') {
    // Generate a random referral code (you can customize the length)
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase(); 
    params.args.data.referralCode = referralCode;
  }

  return next(params);
});

export async function POST(req, res) {
  const { email, password, username, mobile, referredBy } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        mobile,
        referredBy: referredBy || null, // Set to null if not provided
      },
    });
    return new Response(JSON.stringify(user), {
      status: 201,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return new Response(
        JSON.stringify({ error: 'Email, username, mobile, or referral code already exists' }),
        {
          status: 400,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'User registration failed', details: error.message }),
        {
          status: 500,
        }
      );
    }
  }
}