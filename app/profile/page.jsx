"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home, Trophy, Users, Settings, LogOut, Edit, CreditCard, HelpCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios"; // Assuming Axios for API requests

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    bgmiPlayerId: "",
    bgmiPlayerName: "",
  });

  // Fetch user profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get("/api/user/profile"); // Replace with your API endpoint
        setUserProfile(response.data);
        setFormData({
          email: response.data.email,
          phone: response.data.mobile,
          bgmiPlayerId: response.data.teams0.inGamePlayerId,
          bgmiPlayerName: response.data.inGameName,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put("/api/user/profile", formData); // Replace with your API endpoint
      setUserProfile({ ...userProfile, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
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
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile.profilePic || "/assets/profile-pic.png"} alt={userProfile.name} />
                <AvatarFallback>{userProfile.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                <p className="text-muted-foreground">@{userProfile.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Personal Information
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Save" : "Edit"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bgmiPlayerId">BGMI Player ID</Label>
                  <Input
                    id="bgmiPlayerId"
                    value={formData.inGamePlayerId}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bgmiPlayerName">BGMI In-Game Name</Label>
                  <Input
                    id="bgmiPlayerName"
                    value={formData.inGameName}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                {isEditing && (
                  <Button className="w-full" onClick={handleSave}>
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold">Balance: ₹{userProfile.depositWallet}</div>
                <Button className="w-full">Add Funds</Button>
                <Button className="w-full" variant="outline">Withdraw Funds</Button>
                <div className="text-sm text-muted-foreground">
                  Transaction History
                  {/* Transaction history component */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Other sections like logout, contact support */}
      </main>

      
    </div>
  );
}