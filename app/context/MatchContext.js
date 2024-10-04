// context/MatchContext.js
"use client"
import { createContext, useContext, useState } from "react";

// Create the context

const MatchContext = createContext();

// Create a provider component
export const MatchProvider = ({ children }) => {
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  return (
    <MatchContext.Provider value={{ selectedMatchId, setSelectedMatchId }}>
      {children}
    </MatchContext.Provider>
  );
};

// Custom hook to use the MatchContext
export const useMatch = () => useContext(MatchContext);