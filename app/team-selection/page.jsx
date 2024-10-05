"use client";

import jwtDecode from "jwt-decode";
import { useState, useEffect } from "react";
import { useMatch } from "../context/MatchContext";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Trophy, Users, Settings, ArrowLeft, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TeamSelection() {
  const { selectedMatchId } = useMatch();

  const [teams, setTeams] = useState([]); // Array to hold multiple teams
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all teams created by the user from the API
  useEffect(() => {
    if (!selectedMatchId) {
      setError("Select one match first. Go back and join again.");
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/team/myTeam"); // Assuming the updated endpoint for fetching all teams
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();
        setTeams(data.teams); // Set all teams to state
      } catch (error) {
        console.error("Error fetching teams:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedMatchId]);

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId); // Set selected team ID
  };

  

const handleJoinTournament = async () => {
  // Extract token from cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find(cookie => cookie.startsWith("token="));
    if (tokenCookie) {
      return tokenCookie.split("=")[1]; // Get the token part
    }
    return null;
  };

  const token = getTokenFromCookies();
  if (!token) {
    console.error("No token found in cookies");
    return;
  }

  // Decode the JWT token to get the userId
  let userId;
  try {
    const decodedToken = jwtDecode(token); // Decode the JWT token
    userId = decodedToken.userId; // Assuming userId is stored in the token
  } catch (error) {
    console.error("Error decoding token:", error);
    return;
  }

  if (!selectedTeam || !selectedMatchId) {
    console.error("Missing required data: teamId or matchId");
    return;
  }

  try {
    const response = await fetch(`/api/match/join/${selectedMatchId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamId: selectedTeam,
        userId: userId, // Pass the extracted userId from the token
      }),
    });

    if (response.ok) {
      setShowSuccessDialog(true);
    } else {
      const errorData = await response.json();
      console.error("Failed to join match:", errorData);
    }
  } catch (error) {
    console.error("Error joining match:", error);
  }
};

  // Loading state
  if (loading) {
    return <div className="p-4">Loading teams...</div>;
  }

  // Error state
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Select Team</h1>
          </div>
          <Link href="/create-team">
            <Button variant="ghost" size="icon">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        <div className="space-y-4">
          {teams.length > 0 ? (
            teams.map((team) => (
              <Card
                key={team.id}
                className={`overflow-hidden ${
                  selectedTeam === team.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleTeamSelect(team.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={team.logo}
                      alt={`${team.teamName} logo`}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{team.teamName}</h2>
                      <p className="text-sm text-muted-foreground">
                        Created by: {team.teamCreatedBy.username}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="text-sm">
                        <p className="font-semibold">{member.inGameName}</p>
                        <p className="text-muted-foreground">
                          {member.inGamePlayerId}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div>No teams found. Create one!</div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Join Button */}
      <div className="sticky bottom-16 bg-white shadow-lg p-4">
        <Button
          className="w-full"
          disabled={!selectedTeam}
          onClick={handleJoinTournament}
        >
          Join Tournament (₹100 will be deducted)
        </Button>
      </div>

      {/* Sticky Bottom Navigation */}
      <motion.nav
        className="sticky bottom-0 bg-white shadow-lg"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-around p-2">
          {[
            { icon: Home, label: "Home" },
            { icon: Trophy, label: "Tournaments" },
            { icon: Users, label: "Teams" },
            { icon: Settings, label: "Settings" },
          ].map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="flex flex-col items-center"
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </motion.nav>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Successfully Joined!</DialogTitle>
            <DialogDescription>
              Your team has been successfully registered for the tournament.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}