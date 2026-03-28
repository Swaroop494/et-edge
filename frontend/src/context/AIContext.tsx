"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AIContextType {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  initialMessage?: string;
  setInitialMessage: (msg: string | undefined) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined);

  return (
    <AIContext.Provider value={{ isChatOpen, setIsChatOpen, initialMessage, setInitialMessage }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
