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
import DeerDraw from "./pages/DeerDraw";
import DeerHarvest from "./pages/DeerHarvest";
import ElkDraw from "./pages/ElkDraw";
import ElkHarvest from "./pages/ElkHarvest";
import AntelopeDraw from "./pages/AntelopeDraw";
import AntelopeHarvest from "./pages/AntelopeHarvest";

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
            
            <Route path="/deer" element={<DeerDraw />} />
            <Route path="/deer-harvest" element={<DeerHarvest />} />
            <Route path="/elk" element={<ElkDraw />} />
            <Route path="/elk-harvest" element={<ElkHarvest />} />
            <Route path="/antelope" element={<AntelopeDraw />} />
            <Route path="/antelope-harvest" element={<AntelopeHarvest />} />
            <Route path="/otc-elk" element={<ComingSoon title="OTC Elk Units" description="Over-the-counter elk unit information with harvest statistics." />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
