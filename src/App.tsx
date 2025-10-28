import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import InstitutionSignup from "./pages/InstitutionSignup";
import DemoInstitution from "./pages/DemoInstitution";
import Dashboard from "./pages/Dashboard";
import ClassDetail from "./pages/ClassDetail";
import DiagnosticTool from "./pages/DiagnosticTool";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/institution-signup" element={<InstitutionSignup />} />
          <Route path="/demo" element={<DemoInstitution />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/class/:classId" element={<ClassDetail />} />
          <Route path="/diagnostic" element={<DiagnosticTool />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
