import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Loader2, Plus, Settings, Users, Edit, UserPlus, 
  ChevronLeft, Building, ArrowLeft 
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
// Define types locally
interface Club {
  id: number;
  name: string;
  address: string;
  phone?: string;
  licenseLevel: string;
  ownerId: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  clubOwnerId?: number;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // UI State
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [isClubDialogOpen, setIsClubDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isManagingClubUsers, setIsManagingClubUsers] = useState(false);
  
  // Query for fetching clubs
  const { 
    data: clubs = [], 
    isLoading: isLoadingClubs,
    refetch: refetchClubs
  } = useQuery<Club[]>({
    queryKey: ['/api/clubs'],
    enabled: user?.role === 'admin'
  });
  
  // Query for fetching users for a specific club
  const { 
    data: clubUsers = [], 
    isLoading: isLoadingClubUsers,
    refetch: refetchClubUsers
  } = useQuery<User[]>({
    queryKey: ['/api/clubs', selectedClubId, 'users'],
    queryFn: async () => {
      if (!selectedClubId) return [];
      const res = await apiRequest('GET', `/api/clubs/${selectedClubId}/users`);
      return res.json();
    },
    enabled: !!selectedClubId && isManagingClubUsers
  });
  
  // Mutation for creating a new club
  const createClubMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/clubs', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Club created successfully",
        description: "The new club has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clubs'] });
      setIsClubDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create club",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for creating a new user
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedClubId) throw new Error("No club selected");
      const res = await apiRequest('POST', `/api/clubs/${selectedClubId}/users`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new user has been added to the club.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clubs', selectedClubId, 'users'] });
      setIsUserDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Club form schema
  const clubFormSchema = z.object({
    name: z.string().min(3, { message: "Club name must be at least 3 characters" }),
    address: z.string().min(5, { message: "Address must be at least 5 characters" }),
    phone: z.string().optional(),
    licenseLevel: z.string().default("basic"),
  });
  
  // User form schema
  const userFormSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
    role: z.enum(["club_owner", "dealer"], { 
      errorMap: () => ({ message: "Please select a valid role" })
    }),
  });
  
  // Club form
  const clubForm = useForm<z.infer<typeof clubFormSchema>>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      licenseLevel: "basic",
    },
  });
  
  // User form
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "dealer",
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/auth");
  };

  const handleCreateClub = () => {
    clubForm.reset();
    setIsClubDialogOpen(true);
  };
  
  const handleManageClub = (clubId: number) => {
    setSelectedClubId(clubId);
    // For now, we'll just show an alert
    alert(`Managing club ${clubId} would be implemented here`);
  };
  
  const handleManageClubUsers = (clubId: number) => {
    setSelectedClubId(clubId);
    setIsManagingClubUsers(true);
    refetchClubUsers();
  };
  
  const handleBackToClubs = () => {
    setSelectedClubId(null);
    setIsManagingClubUsers(false);
  };

  const handleCreateUser = () => {
    if (!selectedClubId && !isManagingClubUsers) {
      alert("Please select a club first");
      return;
    }
    userForm.reset();
    setIsUserDialogOpen(true);
  };
  
  const onSubmitClub = (data: z.infer<typeof clubFormSchema>) => {
    createClubMutation.mutate(data);
  };
  
  const onSubmitUser = (data: z.infer<typeof userFormSchema>) => {
    createUserMutation.mutate(data);
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
              {isManagingClubUsers && selectedClubId ? (
                // Club Users Management View
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" onClick={handleBackToClubs} className="mr-2">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clubs
                      </Button>
                      <h3 className="text-xl font-semibold">
                        Club Users {clubs.find(c => c.id === selectedClubId)?.name ? `- ${clubs.find(c => c.id === selectedClubId)?.name}` : ''}
                      </h3>
                    </div>
                    <Button onClick={handleCreateUser}>
                      <UserPlus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingClubUsers ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : clubUsers.length === 0 ? (
                        <div className="text-center py-10">
                          <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                          <p className="text-muted-foreground mb-4">Add users to this club</p>
                          <Button onClick={handleCreateUser}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="py-3 px-4 text-left">Username</th>
                                <th className="py-3 px-4 text-left">Full Name</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Role</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clubUsers.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-muted/50">
                                  <td className="py-3 px-4">{user.username}</td>
                                  <td className="py-3 px-4">{user.fullName}</td>
                                  <td className="py-3 px-4">{user.email}</td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                      ${user.role === 'club_owner' ? 'bg-blue-100 text-blue-800' : 
                                        user.role === 'dealer' ? 'bg-green-100 text-green-800' : 
                                        'bg-gray-100 text-gray-800'}`}>
                                      {user.role === 'club_owner' ? 'Club Owner' : 
                                       user.role === 'dealer' ? 'Dealer' : 
                                       user.role}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Club List View
                <>
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
                      {isLoadingClubs ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : clubs.length === 0 ? (
                        <div className="text-center py-10">
                          <h3 className="text-xl font-semibold mb-2">No Clubs Added Yet</h3>
                          <p className="text-muted-foreground mb-4">Create your first club to get started</p>
                          <Button onClick={handleCreateClub}>
                            <Plus className="mr-2 h-4 w-4" /> Create Club
                          </Button>
                        </div>
                      ) : (
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
                              {clubs.map((club) => (
                                <tr key={club.id} className="border-b hover:bg-muted/50">
                                  <td className="py-3 px-4">{club.name}</td>
                                  <td className="py-3 px-4">Club Owner</td>
                                  <td className="py-3 px-4">{club.address}</td>
                                  <td className="py-3 px-4">1</td>
                                  <td className="py-3 px-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleManageClub(club.id)}>
                                      Manage
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleManageClubUsers(club.id)}>
                                      Users
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
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
                  {false ? (
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
    
      {/* Club and User dialogs would normally be rendered here */}
    </div>
  );
}