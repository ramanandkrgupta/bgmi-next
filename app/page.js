"use client";

import { useState, useEffect } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BellRing } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMatch } from "./context/MatchContext" // Import the custom hook
import Link from "next/link";

export default function TournamentApp() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [tournaments, setTournaments] = useState({
    upcoming: [],
    ongoing: [],
    completed: [],
  });

  const router = useRouter();
  const { setSelectedMatchId } = useMatch(); // Destructure setSelectedMatchId from the context

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get("/api/match/list");
        console.log("Fetched tournaments:", response.data); // Log fetched data

        // Structure tournaments by their status
        setTournaments(response.data);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);

  const handleJoinClick = (matchId) => {
    // Set match ID in context instead of URL
    setSelectedMatchId(matchId);

    // Navigate to team selection without passing matchId in the URL
    router.push("/team-selection");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">BGMI Tournaments</h1>
          <Button variant="ghost" size="icon">
            <BellRing className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        {/* Tab Group */}
        <Tabs defaultValue="upcoming" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" onClick={() => setActiveTab("upcoming")}>
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="ongoing" onClick={() => setActiveTab("ongoing")}>
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setActiveTab("completed")}>
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tournament List */}
        <div className="space-y-4">
          {Array.isArray(tournaments[activeTab]) && tournaments[activeTab].length > 0 ? (
            tournaments[activeTab].map((tournament) => (
              <Card key={tournament.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src={tournament.bannerImage}
                    alt={`${tournament.name} banner`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                    quality={10}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                  <h2 className="absolute bottom-2 left-4 text-xl font-bold text-white">
                    {tournament.name}
                  </h2>
                </div>
                <CardContent className="p-4">
                <p className="text-blue-500 text-sm font-bold">
          <span className="font-semibold text-red-400">Start Date:</span> {new Date(tournament.startDate).toLocaleDateString()} {new Date(tournament.startDate).toLocaleTimeString()}
        </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Entry Fee: {tournament.entryFee}</div>
                    <div>Prize Pool: {tournament.prize}</div>
                    <div>Per Kill: {tournament.perKill}</div>
                    <div>Map: {tournament.map}</div>
                    <div>Mode: {tournament.mode}</div>
                    <div>
                      Joined: {tournament._count.teams || 0}/{tournament.maxTeamJoin}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-2 flex justify-between">
                  <Link href={`/match/${tournament.id}`} passHref>
                    <Button as="a" variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Button size="sm" onClick={() => handleJoinClick(tournament.id)}>
                    Join
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="bg-slate-800 text-white p-2">No tournaments found.</p>
          )}
        </div>
      </main>

      {/* Sticky Bottom Navigation */}
      {/* <motion.nav
        className="sticky bottom-0 bg-white shadow-lg"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-around p-2">
          {[{ icon: Home, label: "Home" }, { icon: Trophy, label: "Tournaments" }, { icon: Users, label: "Teams" }, { icon: Settings, label: "Settings" }].map((item, index) => (
            <Button key={index} variant="ghost" size="icon" className="flex flex-col items-center">
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </motion.nav> */}
    </div>
  );
}