import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import DashboardLayout from "./components/DashboardLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import EventIntelligence from "./pages/EventIntelligence.tsx";
import Explainability from "./pages/Explainability.tsx";
import PortfolioImpact from "./pages/PortfolioImpact.tsx";
import VideoBriefingPage from "./pages/VideoBriefingPage.tsx";
import FinfluencerPage from "./pages/FinfluencerPage.tsx";
import WhatIfPage from "./pages/WhatIfPage.tsx";
import LearningLoopPage from "./pages/LearningLoopPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<EventIntelligence />} />
            <Route path="/explain" element={<Explainability />} />
            <Route path="/impact" element={<PortfolioImpact />} />
            <Route path="/video" element={<VideoBriefingPage />} />
            <Route path="/detector" element={<FinfluencerPage />} />
            <Route path="/whatif" element={<WhatIfPage />} />
            <Route path="/learning" element={<LearningLoopPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
