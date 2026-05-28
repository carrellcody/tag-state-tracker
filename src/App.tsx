import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import HomeNew from "./pages/HomeNew";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Learn from "./pages/Learn";
import TableGuide from "./pages/TableGuide";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DeerDraw from "./pages/DeerDraw";
import DeerHarvest from "./pages/DeerHarvest";
import ElkDraw from "./pages/ElkDraw";
import ElkHarvest from "./pages/ElkHarvest";
import AntelopeDraw from "./pages/AntelopeDraw";
import AntelopeHarvest from "./pages/AntelopeHarvest";
import OTCElk from "./pages/OTCElk";
import OTCAntelope from "./pages/OTCAntelope";
import OTCDeer from "./pages/OTCDeer";
import DeerDrawNew from "./pages/DeerDrawNew";
import OTCDeerNew from "./pages/OTCDeerNew";
import DeerUnits from "./pages/DeerUnits";
import DeerLeftovers from "./pages/DeerLeftovers";
import ElkDrawNew from "./pages/ElkDrawNew";
import OTCElkNew from "./pages/OTCElkNew";
import ElkUnits from "./pages/ElkUnits";
import ElkLeftovers from "./pages/ElkLeftovers";
import AntelopeDrawNew from "./pages/AntelopeDrawNew";
import OTCAntelopeNew from "./pages/OTCAntelopeNew";
import AntelopeUnits from "./pages/AntelopeUnits";
import AntelopeLeftovers from "./pages/AntelopeLeftovers";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import EmailPreferences from "./pages/EmailPreferences";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import Welcome from "./pages/Welcome";
import AdminUpload from "./pages/AdminUpload";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import Leftovers from "./pages/Leftovers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/homenew" element={<HomeNew />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/table-guide" element={<TableGuide />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/email-preferences" element={<EmailPreferences />} />
              
              <Route path="/deer-draw-old" element={<DeerDraw />} />
              <Route path="/deer-harvest" element={<DeerHarvest />} />
              <Route path="/elk-draw-old" element={<ElkDraw />} />
              <Route path="/elk-harvest" element={<ElkHarvest />} />
              <Route path="/antelope-draw-old" element={<AntelopeDraw />} />
              <Route path="/antelope-harvest" element={<AntelopeHarvest />} />
              <Route path="/otc-elk-old" element={<OTCElk />} />
              <Route path="/otc-antelope-old" element={<OTCAntelope />} />
              <Route path="/otc-deer-old" element={<OTCDeer />} />
              <Route path="/deer-draw" element={<DeerDrawNew />} />
              <Route path="/otc-deer" element={<OTCDeerNew />} />
              <Route path="/Deer-Units" element={<DeerUnits />} />
              <Route path="/Deer-Leftovers" element={<DeerLeftovers />} />
              <Route path="/elk-draw" element={<ElkDrawNew />} />
              <Route path="/otc-elk" element={<OTCElkNew />} />
              <Route path="/Elk-Units" element={<ElkUnits />} />
              <Route path="/Elk-Leftovers" element={<ElkLeftovers />} />
              <Route path="/antelope-draw" element={<AntelopeDrawNew />} />
              <Route path="/otc-antelope" element={<OTCAntelopeNew />} />
              <Route path="/Antelope-Units" element={<AntelopeUnits />} />
              <Route path="/Antelope-Leftovers" element={<AntelopeLeftovers />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/upload" element={<AdminUpload />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/leftovers" element={<Leftovers />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
