import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // Make sure to install this library
import prisma from '@/lib/prisma'; // Ensure the import path is correct

export async function POST(req, { params }) {
  const { id } = params; // Match ID from the URL

  // Extract token from cookies
  const { cookie } = req.headers;

  if (!cookie) {
    return NextResponse.json({ error: 'No cookies found' }, { status: 401 });
  }

  // Find the token in the cookies
  const tokenCookie = cookie.split('; ').find(c => c.startsWith('token='));
  if (!tokenCookie) {
    return NextResponse.json({ error: 'Token not found in cookies' }, { status: 401 });
  }

  const token = tokenCookie.split('=')[1]; // Extract the token from the "token=" part of the cookie

  // Decode and verify the token to get the userId
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
    userId = decoded.userId; // Assuming the userId is stored in the token's payload
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }

  // Proceed with the rest of your logic
  const { teamId } = await req.json(); // Expecting teamId from the request body

  try {
    // Find the match based on the provided ID
    const match = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: true, // Include related tournament details
        participants: true, // Include participants to check if the user has already joined
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Find the team based on the provided team code
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true, // Include members if necessary
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify the user is a member of the team
    const isMember = team.members.some(member => member.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: 'User is not a member of this team' }, { status: 403 });
    }

    // Handle the wallet transactions
    const entryFee = match.entryFee; // Assuming entryFee exists in the tournament model

    // Check the user's wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize amounts deducted from each wallet
    let depositDeduction = 0;
    let winningsDeduction = 0;
    let bonusDeduction = 0;
    const bonusFee = entryFee * 0.02; // Calculate 2% of entry fee for bonus deduction

    // Attempt to deduct from the deposit wallet first
    if (user.depositWallet >= entryFee) {
      depositDeduction = entryFee; // Full entry fee from deposit wallet
    } else {
      depositDeduction = user.depositWallet; // Use whatever is available in deposit wallet
      const remainingEntryFee = entryFee - depositDeduction; // Calculate remaining fee to deduct

      // Now try to deduct from the winnings wallet
      if (user.winningsWallet >= remainingEntryFee) {
        winningsDeduction = remainingEntryFee; // Full remaining fee from winnings wallet
      } else {
        winningsDeduction = user.winningsWallet; // Use whatever is available in winnings wallet
        const totalDeduction = depositDeduction + winningsDeduction;

        // If still not enough to cover entry fee
        if (totalDeduction < entryFee) {
          return NextResponse.json({ error: 'Insufficient funds in wallets' }, { status: 400 });
        }
      }
    }

    // Deduct from the deposit and winnings wallets
    await prisma.user.update({
      where: { id: userId },
      data: {
        depositWallet: { decrement: depositDeduction },
        winningsWallet: { decrement: winningsDeduction },
      },
    });

    // Now deduct 2% from the bonus wallet if available
    if (user.bonusWallet > 0) {
      bonusDeduction = Math.min(user.bonusWallet, bonusFee); // Deduct the lesser of available bonus or calculated bonus fee
      await prisma.user.update({
        where: { id: userId },
        data: {
          bonusWallet: { decrement: bonusDeduction },
        },
      });
    }

    // Record the transaction in the database
    await prisma.transaction.create({
      data: {
        userId,
        matchId: id,
        amount: entryFee, // Total entry fee
        type: 'JOIN', // Transaction type
        walletType: 'COMBINED',
        walletTypeUsed: {
          create: [
            {
              walletType: 'DEPOSIT',
              amount: depositDeduction,
            },
            {
              walletType: 'WINNINGS',
              amount: winningsDeduction,
            },
            {
              walletType: 'BONUS',
              amount: bonusDeduction,
            },
          ],
        },
        date: new Date(),
      },
    });

    // Check if the user is already participating in the tournament
    const userTournament = await prisma.userTournament.findFirst({
      where: {
        userId: userId,
        tournamentId: id,
      },
    });

    if (userTournament) {
      return NextResponse.json({ error: 'User already joined this tournament' }, { status: 400 });
    }

    // Create a new UserTournament entry
    await prisma.userTournament.create({
      data: {
        user: {
          connect: { id: userId }, // Connect the user by userId
        },
        tournament: {
          connect: { id: id }, // Connect the tournament
        },
        team: {
          connect: { id: team.id }, // Use team.id to connect to the Team model
        },
      },
    });

    // Add the team to the tournament's teams array if it isn't already included
    const teamExistsInTournament = match.teams.some(t => t.id === team.id);

    if (!teamExistsInTournament) {
      await prisma.tournament.update({
        where: { id },
        data: {
          teams: {
            connect: { id: team.id }, // Connect the team to the tournament
          },
        },
      });
    }

    return NextResponse.json({ message: 'Successfully joined the match' }, { status: 200 });
  } catch (error) {
    console.error('Error in joining match:', error);
    return NextResponse.json({ error: 'Failed to join match', details: error.message }, { status: 500 });
  }
}