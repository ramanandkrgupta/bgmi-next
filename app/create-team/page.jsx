"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Trophy, Users, Settings, ArrowLeft, Copy, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [teamLogoUrl, setTeamLogoUrl] = useState(""); // Using URL for team logo
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [teamCode, setTeamCode] = useState("");

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/team/create", {
        method: "POST",
        body: JSON.stringify({
          teamName,
          teamLogoUrl, // Send the logo URL directly
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamCode(data.teamCode);
        setTeamLogoUrl(data.logo); // Use the logo URL returned from the API if needed
        setShowSuccessDialog(true);
      } else {
        const errorData = await response.json();
        console.error("Error creating team:", errorData.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamCode);
  };

  const handleShareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join my BGMI team!",
        text: `Use this code to join my team: ${teamCode}`,
        url: window.location.origin + "/join-team",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/team-selection">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Create New Team</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="teamLogoUrl">Team Logo URL</Label>
            <Input
              id="teamLogoUrl"
              value={teamLogoUrl}
              onChange={(e) => setTeamLogoUrl(e.target.value)}
              placeholder="Enter image URL"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Create Team
          </Button>
        </form>
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
            <DialogTitle>Team Created Successfully!</DialogTitle>
            <DialogDescription>
              Your team has been created. Share the team code with others to let
              them join.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-4 mb-4">
            {teamLogoUrl && (
              <Image
                src={teamLogoUrl}
                alt="Team Logo Preview"
                width={100}
                height={100}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-bold">{teamName}</p>
              <p className="text-sm text-muted-foreground">Created by: You</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Team Code</p>
            <p className="text-2xl font-bold">{teamCode}</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleCopyCode} className="flex-1">
              <Copy className="mr-2 h-4 w-4" /> Copy Code
            </Button>
            <Button onClick={handleShareCode} className="flex-1">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}