"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Trophy, Users, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function JoinTeam() {
  const [teamCode, setTeamCode] = useState("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleJoinTeam = async (e) => {
    e.preventDefault()

    try {
      // Make API request to join team using the team code
      const res = await fetch(`/api/team/join/${teamCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        // Team joined successfully
        setShowSuccessDialog(true)
        setErrorMessage("")
      } else {
        // Handle error response
        const { error } = await res.json()
        setErrorMessage(error || "Failed to join the team. Please try again.")
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.")
    }
  }

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
            <h1 className="text-xl font-bold">Join Team</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <div>
            <Label htmlFor="teamCode">Team Code</Label>
            <Input
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="Enter team code"
              required
            />
          </div>
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          <Button type="submit" className="w-full">Join Team</Button>
        </form>
      </main>

      

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Successfully Joined Team!</DialogTitle>
            <DialogDescription>
              You have successfully joined the team. You can now participate in tournaments with your new team.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}