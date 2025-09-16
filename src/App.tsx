
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from "@/components/layout/AppLayout";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Approvals from "./pages/Approvals";
import Financial from "./pages/Financial";
import Comercial from "./pages/Comercial";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Campaigns from "./pages/Campaigns";
import Integrations from "./pages/Integrations";
import ProcessingUnits from "./pages/ProcessingUnits";
import { CommemorateDatesPage } from "./pages/CommemorateDatesPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import PublicApproval from "@/pages/PublicApproval";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>      
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/approval/:token" element={<PublicApproval />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoutes>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/financial" element={<AppLayout><Financial /></AppLayout>} />
                <Route path="/campaigns" element={<AppLayout><Campaigns /></AppLayout>} />

                <Route path="/approvals" element={<AppLayout><Approvals /></AppLayout>} />
                <Route path="/comercial" element={<AppLayout><Comercial /></AppLayout>} />
                <Route path="/processing-units" element={<AppLayout><ProcessingUnits /></AppLayout>} />
                <Route path="/commemorative-dates" element={<AppLayout><CommemorateDatesPage /></AppLayout>} />
                <Route path="/users" element={<AppLayout><Users /></AppLayout>} />
                <Route path="/integrations" element={<AppLayout><Integrations /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
              </Routes>
            </ProtectedRoutes>
          } />
        </Routes>
        <SonnerToaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
