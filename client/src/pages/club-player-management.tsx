import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { PlayerQueue } from '@/components/PlayerQueue';
import { AddToQueueForm } from '@/components/AddToQueueForm';
import { ClubPlayerLimits } from '@/components/ClubPlayerLimits';
import { ClubHeader } from '@/components/ClubHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Users, QrCode, List } from 'lucide-react';

type Club = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ownerId: number;
};

type Table = {
  id: number;
  name: string;
  clubId: number;
  dealerId?: number;
  gameType: string;
  limits?: string;
};

export default function ClubPlayerManagementPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { clubId: clubIdParam } = useParams<{ clubId?: string }>();
  const clubId = clubIdParam ? parseInt(clubIdParam) : undefined;
  const [activeTab, setActiveTab] = useState<string>('queue');
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>(undefined);

  // Redirect to home if no clubId
  useEffect(() => {
    if (!clubId) {
      setLocation('/');
    }
  }, [clubId, setLocation]);

  // Fetch club data
  const { data: club, isLoading: isClubLoading, error: clubError } = useQuery<Club>({
    queryKey: ['/api/clubs', clubId],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}`).then(res => res.json()),
    enabled: !!clubId,
  });

  // Fetch tables for the club
  const { data: tables, isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ['/api/clubs', clubId, 'tables'],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}/tables`).then(res => res.json()),
    enabled: !!clubId,
  });

  // Check if user has access to this club
  const hasAccess = 
    user?.role === 'admin' || 
    (user?.role === 'club_owner' && club?.ownerId === user.id) ||
    (user?.role === 'dealer' && user?.clubOwnerId === club?.ownerId);

  if (!hasAccess && !isClubLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view this club's player management dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isClubLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (clubError || !club) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              There was an error loading the club data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{(clubError as Error)?.message || 'Club not found'}</p>
            <Button className="mt-4" onClick={() => setLocation('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <ClubHeader 
        clubId={club.id} 
        clubName={club.name} 
        clubAddress={club.address} 
        activeTab="player-management" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AddToQueueForm clubId={club.id} defaultTableId={selectedTableId} />
        </div>
        <div>
          <ClubPlayerLimits clubId={club.id} />
        </div>
      </div>

      <Tabs defaultValue="queue" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            Club Queue
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center">
            <QrCode className="h-4 w-4 mr-2" />
            Table Queues
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Player Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue" className="mt-6">
          <PlayerQueue clubId={club.id} />
        </TabsContent>
        
        <TabsContent value="tables" className="mt-6">
          {tablesLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tables && tables.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <Card 
                    key={table.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      selectedTableId === table.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedTableId(
                      selectedTableId === table.id ? undefined : table.id
                    )}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{table.name}</CardTitle>
                      <CardDescription>{table.gameType} {table.limits && `- ${table.limits}`}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant={selectedTableId === table.id ? "default" : "outline"} 
                        size="sm"
                        className="w-full"
                      >
                        {selectedTableId === table.id ? 'Selected' : 'Select Table'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              {selectedTableId ? (
                <PlayerQueue clubId={club.id} tableId={selectedTableId} />
              ) : (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Table Queue</CardTitle>
                    <CardDescription>
                      Select a table above to view its queue
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>No Tables Found</CardTitle>
                <CardDescription>
                  This club does not have any tables configured.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="players" className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Player Management</CardTitle>
              <CardDescription>
                Create, edit and manage players in this club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                Player management functionality will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}