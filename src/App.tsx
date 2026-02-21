import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AtmosphereProvider } from "@/contexts/AtmosphereContext";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import SmartCityDashboard from "./pages/SmartCityDashboard";
import EcoRouting from "./pages/EcoRouting";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import EmergencyServices from "./pages/EmergencyServices";
import PublicTransport from "./pages/PublicTransport";
import PublicControl from "./pages/PublicControl";
import Infrastructure from "./pages/Infrastructure";
import Ecosystem from "./pages/Ecosystem";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AtmosphereProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Layout><SmartCityDashboard /></Layout>} />
                <Route path="/eco-routing" element={<Layout><EcoRouting /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
                <Route path="/emergency" element={<Layout><EmergencyServices /></Layout>} />
                <Route path="/transport" element={<Layout><PublicTransport /></Layout>} />
                <Route path="/community" element={<Layout><PublicControl /></Layout>} />
                <Route path="/infrastructure" element={<Layout><Infrastructure /></Layout>} />
                <Route path="/ecosystem" element={<Layout><Ecosystem /></Layout>} />
                <Route path="/docs" element={<Docs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </AtmosphereProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
