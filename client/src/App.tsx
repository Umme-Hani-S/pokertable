import { Switch, Route } from "wouter";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import NotFound from "./pages/not-found";
import PokerTable from "./components/PokerTable";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import ClubPlayerManagementPage from "./pages/club-player-management";

// Import Admin Dashboard
import AdminDashboard from "./pages/admin-dashboard";
const ClubsList = () => <div>Clubs Management (Coming Soon)</div>;
const UsersList = () => <div>Users Management (Coming Soon)</div>;

// Club Owner Dashboard components to be created
const ClubOwnerDashboard = () => <div>Club Owner Dashboard (Coming Soon)</div>;
const ClubDetail = () => <div>Club Detail (Coming Soon)</div>;
const TablesList = () => <div>Tables Management (Coming Soon)</div>;
const PlayersList = () => <div>Players Management (Coming Soon)</div>;

// Dealer pages
const DealerDashboard = () => <div>Dealer Dashboard (Coming Soon)</div>;
const TableDetail = () => <div>Table Detail (Coming Soon)</div>;
const SessionDetail = () => <div>Session Detail (Coming Soon)</div>;

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes - Different User Roles */}
      
      {/* Admin Routes */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminDashboard}
        roles={["admin"]} 
      />
      <ProtectedRoute 
        path="/admin/clubs" 
        component={ClubsList}
        roles={["admin"]} 
      />
      <ProtectedRoute 
        path="/admin/users" 
        component={UsersList}
        roles={["admin"]} 
      />
      
      {/* Club Owner Routes */}
      <ProtectedRoute 
        path="/clubs" 
        component={ClubOwnerDashboard}
        roles={["admin", "club_owner"]} 
      />
      <ProtectedRoute 
        path="/clubs/:id" 
        component={ClubDetail}
        roles={["admin", "club_owner", "dealer"]} 
      />
      <ProtectedRoute 
        path="/clubs/:id/tables" 
        component={TablesList}
        roles={["admin", "club_owner", "dealer"]} 
      />
      <ProtectedRoute 
        path="/clubs/:id/players" 
        component={PlayersList}
        roles={["admin", "club_owner", "dealer"]} 
      />
      
      {/* Dealer Routes */}
      <ProtectedRoute 
        path="/tables/:id" 
        component={TableDetail}
        roles={["admin", "club_owner", "dealer"]} 
      />
      <ProtectedRoute 
        path="/tables/:id/poker" 
        component={PokerTable}
        roles={["admin", "club_owner", "dealer"]} 
      />
      <ProtectedRoute 
        path="/sessions/:id" 
        component={SessionDetail}
        roles={["admin", "club_owner", "dealer"]} 
      />
      
      {/* Home route that redirects based on role */}
      <ProtectedRoute path="/" component={HomePage} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
