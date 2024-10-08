"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Copy, Check, UserPlus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MyTeamsPage() {
  const [teams, setTeams] = useState([])
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    // Fetch teams data from the API
    fetch("/api/team/myTeam")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams || [])) // Ensure teams data is an array
      .catch((error) => console.error("Error fetching teams:", error))
  }, [])

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">My Teams</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 pb-20">
        {/* Create and Join Team Buttons */}
        <div className="flex justify-between mb-4">
          <Link href="/create-team">
            <Button className="flex-1 mr-2">
              <Plus className="mr-2 h-4 w-4" /> Create Team
            </Button>
          </Link>
          <Link href="/join-team">
            <Button variant="outline" className="flex-1 ml-2">
              <UserPlus className="mr-2 h-4 w-4" /> Join Team
            </Button>
          </Link>
        </div>

        {/* Team List or No Teams Found Message */}
        {teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => (
              <Card key={team.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Image
                      src={team.logo}
                      alt={`${team.name} logo`}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{team.teamName}</h2>
                      <Badge>Squad</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Created by:</strong> {team.teamCreatedBy.username}</p>
                    <div className="flex justify-between items-center">
                      <span><strong>Team Code:</strong> {team.teamCode}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(team.teamCode)}
                      >
                        {copiedCode === team.teamCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div>
                      <strong>Members:</strong>
                      <ul className="list-disc pl-5 mt-1">
                        {team.members.map((member, index) => (
                          <li key={index}>
                            {member.inGameName} (ID: {member.inGamePlayerId})
                            {member.isCurrentUser && " (you)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center mt-10">
            <p>No teams found, create one now!</p>
          </div>
        )}
      </main>
    </div>
  )
}