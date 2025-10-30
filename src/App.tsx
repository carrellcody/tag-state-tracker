import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Learn from "./pages/Learn";
import Auth from "./pages/Auth";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Species Draw Pages - Coming Soon */}
            <Route path="/deer" element={<ComingSoon title="Deer Draw Odds" description="Filter and explore 2025 Colorado deer draw statistics with advanced search tools." />} />
            <Route path="/elk" element={<ComingSoon title="Elk Draw Odds" description="Comprehensive elk draw odds for all Colorado units and hunter classes." />} />
            <Route path="/antelope" element={<ComingSoon title="Antelope Draw Odds" description="Browse 2025 antelope draw statistics and find your perfect unit." />} />
            <Route path="/otc-elk" element={<ComingSoon title="OTC Elk Units" description="Over-the-counter elk unit information with harvest statistics." />} />
            
            {/* Harvest Pages - Coming Soon */}
            <Route path="/deer-harvest" element={<ComingSoon title="Deer Harvest Statistics" description="2024 deer harvest data including success rates and hunter density." />} />
            <Route path="/elk-harvest" element={<ComingSoon title="Elk Harvest Statistics" description="Complete 2024 elk harvest statistics for Colorado units." />} />
            <Route path="/antelope-harvest" element={<ComingSoon title="Antelope Harvest Statistics" description="Detailed antelope harvest information from the 2024 season." />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
