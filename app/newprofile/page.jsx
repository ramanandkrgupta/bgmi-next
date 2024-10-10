"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Trophy,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  FileText,
  Shield,
  PhoneCall,
  Award,
  Gamepad,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { UserDetailsDialog } from "@/components/user-details-dialog";

// Define the ActionBox component within the same file
const ActionBox = ({ label, onClick, className = "" }) => {
  return (
    <Button
      variant="outline"
      className={`w-full h-auto py-4 flex flex-col items-center justify-center ${className}`}
      onClick={onClick}
    >
      
      <span>{label}</span>
    </Button>
  );
};

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserProfile(data);
        } else {
          console.error("Error fetching user profile:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!userProfile) {
    return <div>Loading...</div>; // Show loading state until data is fetched
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        <Card className="mb-6" onClick={() => setIsUserDetailsOpen(true)}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile.profilePic || "/assets/profile-pic.png"} alt={userProfile.name} />
                <AvatarFallback>{userProfile.name}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                <p className="text-muted-foreground">@{userProfile.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <ActionBox  label="Join Team" onClick={() => {/* Handle join team */}} />
          <ActionBox  label="Link Game ID" onClick={() => {/* Handle link game ID */}} />
          <ActionBox label="My Teams" onClick={() => {/* Handle my teams */}} />
          <ActionBox  label="My Tournaments" onClick={() => {/* Handle my tournaments */}} />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <ActionBox  label="Terms and Conditions" onClick={() => {/* Handle terms and conditions */}} />
              <ActionBox  label="Privacy Policy" onClick={() => {/* Handle privacy policy */}} />
              <ActionBox  label="Support" onClick={() => {/* Handle support */}} />
              <ActionBox label="Leaderboard" onClick={() => {/* Handle leaderboard */}} />
              <ActionBox label="How to Play?" onClick={() => {/* Handle how to play */}} />
              <ActionBox  label="Logout" onClick={() => {/* Handle logout */}} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </main>

      
      <UserDetailsDialog 
        isOpen={isUserDetailsOpen} 
        onClose={() => setIsUserDetailsOpen(false)} 
        userDetails={userProfile}
      />
    </div>
  );
}