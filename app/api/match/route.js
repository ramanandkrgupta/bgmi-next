import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Create a match (tournament)
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      entryFee,
      prize,
      createdById,
      startDate,
      endDate,
      bannerImage,
      map,
      mode,
      perKill,
      hostName,
      hostLink
    } = body;

    // Validate required fields
    if (!name || !entryFee || !prize || !createdById || !startDate || !endDate || !bannerImage || !map || !mode || !perKill || !hostName || !hostLink) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Create the tournament without teams
    const newTournament = await prisma.tournament.create({
      data: {
        name,
        entryFee,
        prize,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bannerImage,
        map,
        mode,
        perKill,
        maxTeamJoin: map === 'ERANGEL' || map === 'MIRAMAR' ? 25 : 13, // Max teams based on map
        hostName,
        hostLink,
        createdBy: {
          connect: {
            id: createdById, // Connects to the user who created the tournament
          },
        },
      },
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ error: 'Tournament creation failed', details: error.message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    // Get the match ID from the query parameters
    const url = new URL(req.url);
    const matchId = url.searchParams.get('id'); // Assuming the match ID is passed as a query parameter: /api/match-details?id=123

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    // Fetch match (tournament) details along with teams and members
    const matchDetails = await prisma.tournament.findUnique({
      where: {
        id: matchId,
      },
      include: {
        // Include teams that joined the match
        teams: {
          include: {
            members: {
              include: {
                user: false, // Include user details for each team member
              },
            
            },
          },
        },
        // Optionally include the user who created the match
        createdBy: false,
        _count: {
          select: {
            teams: true, // Count the number of teams in the match
            participants: true, // Count participants if applicable
          },
        },
      },
    });

    if (!matchDetails) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(matchDetails, { status: 200 });
  } catch (error) {
    console.error('Error fetching match details:', error);
    return NextResponse.json({ error: 'Failed to fetch match details', details: error.message }, { status: 500 });
  }
}