
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "../components/ui/tabs";
import { Table2, Users, List, Settings } from "lucide-react";

export default function ClubOwnerDashboard() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Club Owner Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your poker club operations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:bg-muted/50 cursor-pointer transition-colors" 
                onClick={() => setLocation("/clubs/tables")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5" />
                Tables
              </CardTitle>
              <CardDescription>
                Manage poker tables and active games
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setLocation("/clubs/player-management")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players
              </CardTitle>
              <CardDescription>
                View and manage players in your club
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setLocation("/clubs/queue")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Queue Management
              </CardTitle>
              <CardDescription>
                Handle player queues and waiting lists
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button onClick={() => setLocation("/clubs/tables/new")}>
              <Table2 className="mr-2 h-4 w-4" />
              Create Table
            </Button>
            <Button onClick={() => setLocation("/clubs/players/new")}>
              <Users className="mr-2 h-4 w-4" />
              Add Player
            </Button>
            <Button onClick={() => setLocation("/clubs/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Club Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
