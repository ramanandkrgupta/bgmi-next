"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Home, Trophy, Users, Settings, ArrowLeft, Copy, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MatchDetails() {
  const { id } = useParams();
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error handling
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No match id found in the url");
      setLoading(false)
      return
    }
    const fetchMatchDetails = async () => {
      try {
        const response = await fetch(`/api/match/?id=${id}`);
        const data = await response.json();

        // Log response for debugging
        console.log("Match Details Response:", data);

        if (!data || data.error) {
          throw new Error(data.error || "Failed to load match details");
        }

        setMatchDetails(data);
      } catch (error) {
        console.error("Error fetching match details:", error);
        setError("Failed to load match details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [id]);

  // Loading state
  if (loading) {
    return <div className="p-4">Loading match details...</div>;
  }

  // Error state
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // If no match details are found after loading
  if (!matchDetails) {
    return <div className="p-4 text-gray-500">No match details found</div>;
  }

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'roomId') {
      setCopiedRoomId(true);
      setTimeout(() => setCopiedRoomId(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };


  const spotsLeft = matchDetails.maxTeamJoin - matchDetails._count.teams;
  const progressPercentage = (matchDetails._count.teams / matchDetails.maxTeamJoin) * 100;

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
            <h1 className="text-xl font-bold">Match Details</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        <Card className="mb-4">
          <CardContent className="p-0">
            <Image
              src={matchDetails.bannerImage}
              alt={matchDetails.title}
              width={600}
              height={200}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-2">{matchDetails.title}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Entry Fee: {matchDetails.entryFee}</div>
                <div>Prize Pool: {matchDetails.prizePool}</div>
                <div>Per Kill: {matchDetails.perKill}</div>
                <div>Map: {matchDetails.map}</div>
                <div>Mode: {matchDetails.mode}</div>
                <div>Joined: {matchDetails._count.teams}/{matchDetails.maxTeamJoin}</div>
              </div>
              <div className="mt-4">
                <p className="text-sm mb-1">Spots left: {spotsLeft}</p>
                <Progress value={progressPercentage} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Room Details</h3>
            <div className="flex justify-between items-center mb-2">
              <span>Room ID: 
                {/* {matchDetails.roomId} */}
                321432
                </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(
                  // matchDetails.roomId,
                  321432,
                   'roomId')}
              >
                {copiedRoomId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>Password:
                 {/* {matchDetails.roomPassword} */}
                 1234
                 </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(
                  // matchDetails.roomPassword,
                  1234,
                   'password')}
              >
                {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="prizepool">Prize Pool</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>
          <TabsContent value="teams">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Logo</TableHead>
                  <TableHead>Team Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchDetails.teams.map((team) => (
                  <TableRow key={team.id} onClick={() => setSelectedTeam(team.id)} className="cursor-pointer">
                    <TableCell>
                      <Image
                        src={team.logo}
                        alt={`${team.teamName} logo`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </TableCell>
                    <TableCell>{team.teamName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="prizepool">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Prize Pool Distribution</h3>
                <p>Total Prize Pool: {matchDetails.prizePool}</p>
                <p>Per Kill: {matchDetails.perKill}</p>
                {/* Add more prize pool details here */}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rules">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Tournament Rules</h3>
                <ul className="list-disc pl-5">
                  {/* {matchDetails.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))} */}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="standings">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Match Standings</h3>
                <p>Standings will be updated after the match.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

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
            <Button key={index} variant="ghost" size="icon" className="flex flex-col items-center">
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </motion.nav>

      {/* Team Details Dialog */}
      <Dialog open={selectedTeam !== null} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Details</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div>
              <p><strong>Team Name:</strong> {selectedTeam.teamName}</p>
              <p><strong>In-Game Name:</strong> {selectedTeam.inGameName}</p>
              <p><strong>Role:</strong> {selectedTeam.role}</p>
              <p><strong>Team Code:</strong> {selectedTeam.teamCode}</p>
              <p><strong>Creator:</strong> {selectedTeam.creator}</p>
              {/* Add more team details as needed */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}