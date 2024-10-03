// app/api/matches/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch upcoming matches with player count
        const upcomingMatches = await prisma.tournament.findMany({
            where: { status: 'upcoming' },
            include: {
                _count: {
                    select: {
                        teams: true,  // Adjust this based on your schema (use 'teams' or 'participants')
                    },
                },
            },
        });

        // Fetch ongoing matches with player count
        const ongoingMatches = await prisma.tournament.findMany({
            where: { status: 'ongoing' },
            include: {
                _count: {
                    select: {
                        participants: true,
                    },
                },
            },
        });

        // Fetch completed matches with player count
        const completedMatches = await prisma.tournament.findMany({
            where: { status: 'completed' },
            include: {
                _count: {
                    select: {
                        participants: true,
                    },
                },
            },
        });

        // Respond with the matches categorized by status
        return NextResponse.json({
            upcoming: upcomingMatches,
            ongoing: ongoingMatches,
            completed: completedMatches,
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Failed to fetch matches', details: error.message });
    }
}