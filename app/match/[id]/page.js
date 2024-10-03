"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("team"); // State to control active tab

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await axios.get(`/api/match/?id=${id}`);
        setMatch(response.data);
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };

    fetchMatchDetails();
  }, [id]);

  if (!match) return <div>Loading...</div>;

  const renderMatchCard = () => {
    const totalSpots = match.maxTeamJoin;
    const joinedSpots = match._count.teams || 0; // Assuming joined teams count comes from the match data
    const spotsLeft = totalSpots - joinedSpots;
    const progressPercentage = (joinedSpots / totalSpots) * 100;

    // Format the start date
    const startDate = new Date(match.startDate);
    const formattedDate = startDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
    const formattedTime = startDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <div className="bg-[#181818] rounded-lg p-4 mb-4 shadow-md relative">
        <img
          src={match.bannerImage}
          alt={`${match.name} Banner`}
          className="h-48 w-full object-cover rounded-t-lg"
        />
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 rounded-t-lg p-2 flex justify-between items-center">
          <span className="text-white text-sm font-bold">PRIZEPOOL</span>
          <span className="text-yellow-400 text-2xl font-bold">{match.prize} INR</span>
        </div>
        <div className="mt-2">
          <h2 className="text-white text-xl font-bold">{match.name}</h2>
          <p className="text-blue-500 text-lg font-bold">
            <span className="font-semibold text-red-400">Start Date:</span>{" "}
            {formattedDate} {formattedTime}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            <div>
              <span className="text-gray-400 font-semibold">Entry Fee:</span>
              <span className="text-white ml-2">{match.entryFee} INR</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold">Map:</span>
              <span className="text-white ml-2">{match.map}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold">Per Kill:</span>
              <span className="text-white ml-2">{match.perKill} INR</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold">Mode:</span>
              <span className="text-white ml-2">{match.mode}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold">Joined:</span>
              <span className="text-white ml-2">
                {joinedSpots}/{totalSpots}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-1">{spotsLeft} spots left</p>
          </div>
        </div>
        {match.status === "upcoming" && (
          <div>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold btn px-16 text-lg rounded-2xl mt-4">
              Join
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTabs = () => (
    <div className="flex space-x-4 mb-6">
      <button
        className={`flex-grow px-4 py-2 rounded ${
          activeTab === "team" ? "bg-yellow-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setActiveTab("team")}
      >
        Team
      </button>
      <button
        className={`flex-grow px-4 py-2 rounded ${
          activeTab === "prizepool" ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setActiveTab("prizepool")}
      >
        Prizepool
      </button>
      <button
        className={`flex-grow px-4 py-2 rounded ${
          activeTab === "rule" ? "bg-red-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setActiveTab("rule")}
      >
        Rule
      </button>
    </div>
  );

  const renderTeamList = (teams) => (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Joined Teams</h3>
      <table className="min-w-full bg-gray-800 text-white">
        <thead>
          <tr>
            <th className="py-2">S.No</th>
            <th className="py-2">Name</th>
            <th className="py-2">Kill</th>
            <th className="py-2">Place Point</th>
            <th className="py-2">Total Point</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team._id} className="bg-gray-700 border-b border-gray-600">
              <td className="py-2 text-center">{index + 1}</td>
              <td className="py-2 text-center">{team.teamName}</td>
              <td className="py-2 text-center">{team.kills}</td>
              <td className="py-2 text-center">{team.placePoints}</td>
              <td className="py-2 text-center">{team.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "team":
        return renderTeamList(match.teams);
      case "prizepool":
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Prizepool</h2>
            <ul className="space-y-2">
              <li className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md">
                <span className="text-yellow-400 font-bold mr-2">Rank 1:</span>
                <span className="text-white">1000 INR</span>
              </li>
              <li className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md">
                <span className="text-yellow-400 font-bold mr-2">Rank 2:</span>
                <span className="text-white">500 INR</span>
              </li>
              <li className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md">
                <span className="text-yellow-400 font-bold mr-2">Rank 3:</span>
                <span className="text-white">200 INR</span>
              </li>
            </ul>
          </div>
        );
      case "rule":
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Game Rules</h2>
            <div className="text-white space-y-2">
              <p>1. Solo and duos players will be disqualified from that match.</p>
              <p>
                2. No kick requests will be taken after 7 minutes of announcing the
                room ID and password.
              </p>
              {/* Add the remaining rules */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {renderMatchCard()}
      {renderTabs()}
      <section>{renderContent()}</section>
    </div>
  );
};

export default MatchDetails;