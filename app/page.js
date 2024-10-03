"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [matches, setMatches] = useState({
    upcoming: [],
    ongoing: [],
    completed: [],
  });
  const [activeTab, setActiveTab] = useState("upcoming"); // State to control active tab
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get("/api/match/list");
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await axios.get("/api/team");
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchMatches();
    fetchTeams();
  }, []);

  const handleJoin = async () => {
    if (!selectedTeamId || !selectedMatch?._id) {
      alert("Please select a team and a match.");
      return;
    }

    try {
      await axios.post(`/tournament/matches/${selectedMatch._id}/join`, {
        teamId: selectedTeamId,
      });
      alert("Successfully joined the match");
      setShowModal(false);
    } catch (error) {
      alert(error.response.data || "Error joining match.");
    }
  };

  const renderMatchCard = (match) => (
    <div key={match._id} className="bg-[#181818] rounded-lg p-4 mb-4 shadow-md relative">
      <img
        src={match.bannerImage}
        alt={`${match.name} Banner`}
        className="h-48 w-full object-cover rounded-t-lg"
      />
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 rounded-t-lg p-2 flex justify-between items-center">
        <span className="text-white text-sm font-bold">PRIZEPOOL</span>
        <span className="text-yellow-400 text-2xl font-bold">{match.prize} INR</span>
      </div>
      <div className="absolute bottom-0 left-50 right-0 bg-black bg-opacity-50 rounded-t-lg  flex justify-between items-center">
        <span className="text-white text-xs font-bold">SPONSORED BY:</span>
        <span className="text-white text-xs font-bold"><a href={match.hostLink}>{match.hostName}</a></span>
      </div>
      <div className="mt-2">
        <h2 className="text-white text-xl font-bold">{match.name}</h2>
        <p className="text-blue-500 text-lg font-bold">
          <span className="font-semibold text-red-400">Start Date:</span> {new Date(match.startDate).toLocaleDateString()} {new Date(match.startDate).toLocaleTimeString()}
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
            <span className="text-white ml-2">{match._count.teams}/{match.maxTeamJoin}</span>
          </div>
        </div>
      </div>
      {match.status === "upcoming" && (
        <button
          onClick={() => {
            setSelectedMatch(match);
            setShowModal(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white font-bold btn px-16 text-lg rounded-2xl mt-4"
        >
          Join
        </button>
      )}
    </div>
  );

  const renderTabs = () => (
    <div className="flex space-x-4 mb-6">
      <button
        className={`flex-grow px-4 py-2 rounded ${
          activeTab === "upcoming" ? "bg-yellow-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setActiveTab("upcoming")}
      >
        Upcoming
      </button>
      <button
        className={`flex-grow px-4 py-2 rounded ${
          activeTab === "ongoing" ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setActiveTab("ongoing")}
      >
        Ongoing
      </button>
      <button
        className={`flex-grow px-4 py-2 rounded ${
          activeTab === "completed" ? "bg-red-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setActiveTab("completed")}
      >
        Completed
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "upcoming":
        return matches?.upcoming?.length > 0
          ? matches.upcoming.map((match) => renderMatchCard(match))
          : "No upcoming matches";
      case "ongoing":
        return matches?.ongoing?.length > 0
          ? matches.ongoing.map((match) => renderMatchCard(match))
          : "No ongoing matches";
      case "completed":
        return matches?.completed?.length > 0
          ? matches.completed.map((match) => renderMatchCard(match))
          : "No completed matches";
      default:
        return null;
    }
  };

  const renderTeamModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${showModal ? "block" : "hidden"}`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-[#181818] p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Select a Team</h2>
        <select
          value={selectedTeamId || ""}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="w-full p-3 border rounded-md bg-gray-100"
        >
          <option value="" disabled>
            Select your team
          </option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleJoin}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ${
              selectedTeamId ? "" : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!selectedTeamId}
          >
            Join with Selected Team
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto pb-4 px-4">
      {renderTabs()} {/* Tab Buttons */}
      <section>{renderContent()}</section> {/* Content based on selected tab */}
      {renderTeamModal()} {/* Team Modal */}
    </div>
  );
};

export default Home;