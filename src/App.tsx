import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Index from "./pages/Index";
import AutomobileManagement from "./pages/AutomobileManagement";
import SuperAdmin from "./pages/SuperAdmin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) return null; // Attendre que l'auth soit stable
  if (!session) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { session, loading } = useAuth();
  
  if (loading) return null;

  return (
    <Routes>
      {/* Route de connexion avec redirection si déjà connecté */}
      <Route 
        path="/login" 
        element={session ? <Navigate to="/" replace /> : <Login />} 
      />
      
      {/* Routes protégées */}
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      <Route path="/automobile" element={
        <ProtectedRoute>
          <AutomobileManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/super-admin" element={
        <ProtectedRoute>
          <SuperAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;