import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2, Plus, Settings, Users } from "lucide-react";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/auth");
  };

  const handleCreateClub = () => {
    // In a real implementation, this would show a modal form
    alert("Club creation would be implemented here");
  };

  const handleCreateUser = () => {
    // In a real implementation, this would show a modal form
    alert("User creation would be implemented here");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Poker Club Manager</h1>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user?.username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="flex flex-col gap-6">
          {/* Page Title */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome to your admin dashboard. Manage all aspects of the poker club system.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No clubs registered yet</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No tables created yet</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No active sessions</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 grid-cols-2">
                    <Button className="w-full" onClick={() => setActiveTab("clubs")}>
                      Create Club
                    </Button>
                    <Button className="w-full" onClick={() => setActiveTab("users")}>
                      Add User
                    </Button>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database Connection</span>
                        <span className="text-sm font-medium text-green-500">Connected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Authentication</span>
                        <span className="text-sm font-medium text-green-500">Working</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage</span>
                        <span className="text-sm font-medium text-green-500">Available</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Clubs Tab */}
            <TabsContent value="clubs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Clubs Management</h3>
                <Button onClick={handleCreateClub}>
                  <Plus className="mr-2 h-4 w-4" /> Create New Club
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Clubs</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="py-3 px-4 text-left">Name</th>
                              <th className="py-3 px-4 text-left">Owner</th>
                              <th className="py-3 px-4 text-left">Address</th>
                              <th className="py-3 px-4 text-left">Tables</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">Default Poker Club</td>
                              <td className="py-3 px-4">Club Owner 1</td>
                              <td className="py-3 px-4">123 Poker Street, Las Vegas</td>
                              <td className="py-3 px-4">1</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleManageClub(1)}>
                                  Manage
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleManageClubUsers(1)}>
                                  Users
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Users Management</h3>
                <Button onClick={handleCreateUser}>
                  <Plus className="mr-2 h-4 w-4" /> Create New User
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <h3 className="text-xl font-semibold mb-2">No Additional Users</h3>
                      <p className="text-muted-foreground mb-4">Create a club first, then add users to it</p>
                      <Button onClick={handleCreateUser}>
                        <Plus className="mr-2 h-4 w-4" /> Create User
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}