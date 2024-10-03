import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a transaction record
async function createTransaction(userId, amount, type, walletType) {
  await prisma.transaction.create({
    data: {
      userId,
      amount,
      type, // e.g., 'debit' or 'credit'
      walletType, // e.g., 'deposit', 'bonus', or 'winnings'
    },
  });
}

// Join Tournament
export async function POST(request) {
  const { userId, tournamentEntryFee } = await request.json();

  try {
    // Fetch user wallet balances
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { depositWallet: true, bonusWallet: true, winningsWallet: true },
    });

    let remainingFee = tournamentEntryFee;

    // Attempt to debit from deposit wallet
    if (user.depositWallet >= remainingFee) {
      await prisma.user.update({
        where: { id: userId },
        data: { depositWallet: { decrement: remainingFee } },
      });
      await createTransaction(userId, remainingFee, 'debit', 'deposit');
      return NextResponse.json({ message: 'Joined tournament successfully!' });
    } else {
      remainingFee -= user.depositWallet;
      // Debit the remaining amount from winnings wallet if needed
      await prisma.user.update({
        where: { id: userId },
        data: { depositWallet: { set: 0 }, winningsWallet: { decrement: remainingFee } },
      });
      await createTransaction(userId, user.depositWallet, 'debit', 'deposit');

      if (remainingFee > 0) {
        if (user.winningsWallet >= remainingFee) {
          await createTransaction(userId, remainingFee, 'debit', 'winnings');
        } else {
          return NextResponse.json({ error: 'Insufficient funds in deposit and winnings wallet' }, { status: 400 });
        }
      }

      // If there's remaining fee, attempt to debit from bonus wallet (percentage)
      const bonusDeduction = remainingFee * 0.1; // e.g., 10% of the remaining fee
      if (user.bonusWallet >= bonusDeduction) {
        await prisma.user.update({
          where: { id: userId },
          data: { bonusWallet: { decrement: bonusDeduction } },
        });
        await createTransaction(userId, bonusDeduction, 'debit', 'bonus');
      }

      return NextResponse.json({ message: 'Joined tournament with some fee from winnings and bonus wallet.' });
    }
  } catch (error) {
    console.error('Error joining tournament:', error);
    return NextResponse.json({ error: 'Failed to join tournament', details: error.message }, { status: 500 });
  }
}

// Deposit Amount
export async function POST(request) {
  const { userId, amount } = await request.json();
  
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { depositWallet: { increment: amount } },
    });

    await createTransaction(userId, amount, 'credit', 'deposit');

    return NextResponse.json({ message: 'Amount deposited successfully' });
  } catch (error) {
    console.error('Error depositing amount:', error);
    return NextResponse.json({ error: 'Failed to deposit amount', details: error.message }, { status: 500 });
  }
}

// Withdraw Winnings
export async function POST(request) {
  const { userId, amount } = await request.json();

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { winningsWallet: true } });

    if (user.winningsWallet < amount) {
      return NextResponse.json({ error: 'Insufficient funds in winnings wallet' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { winningsWallet: { decrement: amount } },
    });

    await createTransaction(userId, amount, 'debit', 'winnings');

    return NextResponse.json({ message: 'Winnings withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing winnings:', error);
    return NextResponse.json({ error: 'Failed to withdraw winnings', details: error.message }, { status: 500 });
  }
}