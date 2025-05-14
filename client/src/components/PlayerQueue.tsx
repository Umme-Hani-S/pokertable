import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ChevronUp, ChevronDown, X, CheckCircle, Clock, Table } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Player = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
};

type QueueEntry = {
  id: number;
  clubId: number;
  playerId: number;
  tableId?: number;
  priority: number;
  status: string;
  joinedAt: string;
  assignedAt?: string;
  notes?: string;
  player: Player;
};

type Table = {
  id: number;
  name: string;
  clubId: number;
  dealerId?: number;
  gameType: string;
  limits?: string;
};

interface PlayerQueueProps {
  clubId: number;
  tableId?: number;
}

export function PlayerQueue({ clubId, tableId }: PlayerQueueProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [assignTableDialogOpen, setAssignTableDialogOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  // Query for getting tables in the club
  const { data: tables } = useQuery<Table[]>({
    queryKey: ['/api/clubs', clubId, 'tables'],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}/tables`).then(res => res.json()),
    enabled: !!clubId,
  });

  // Fetch queue data based on clubId or tableId
  const queueQueryKey = tableId 
    ? ['/api/tables', tableId, 'queue'] 
    : ['/api/clubs', clubId, 'queue'];
  
  const queueQueryPath = tableId 
    ? `/api/tables/${tableId}/queue` 
    : `/api/clubs/${clubId}/queue`;

  const { data: queueData, isLoading, error } = useQuery<QueueEntry[]>({
    queryKey: queueQueryKey,
    queryFn: () => apiRequest('GET', queueQueryPath).then(res => res.json()),
    enabled: !!(clubId || tableId),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Mutation for changing queue priority
  const changePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: number, priority: number }) => {
      const res = await apiRequest('PUT', `/api/queue/${id}`, { priority });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueQueryKey });
      toast({
        title: 'Priority updated',
        description: 'The player priority has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update priority',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for removing from queue
  const removeFromQueueMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/queue/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to remove player from queue');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueQueryKey });
      toast({
        title: 'Player removed',
        description: 'The player has been removed from the queue.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove player',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for assigning player to table
  const assignToTableMutation = useMutation({
    mutationFn: async ({ queueId, tableId }: { queueId: number, tableId: number }) => {
      const res = await apiRequest('POST', `/api/queue/${queueId}/assign/${tableId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueQueryKey });
      setAssignTableDialogOpen(false);
      setSelectedEntry(null);
      setSelectedTableId('');
      toast({
        title: 'Player assigned',
        description: 'The player has been assigned to the table.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to assign player',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAssignToTable = () => {
    if (!selectedEntry || !selectedTableId) return;
    
    assignToTableMutation.mutate({ 
      queueId: selectedEntry.id, 
      tableId: parseInt(selectedTableId) 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Queue</CardTitle>
          <CardDescription>
            There was a problem loading the player queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Player Queue</CardTitle>
        <CardDescription>
          {tableId ? 'Players waiting for this table' : 'Players waiting to be seated'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(!queueData || queueData.length === 0) ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No players in queue</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            {queueData.map((entry) => (
              <div key={entry.id} className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>{entry.player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entry.player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(entry.joinedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={entry.status === 'waiting' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                    {entry.tableId && (
                      <Badge variant="outline" className="ml-1">
                        <Table className="h-3 w-3 mr-1" />
                        {tables?.find(t => t.id === entry.tableId)?.name || `Table ${entry.tableId}`}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">Priority: {entry.priority}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => changePriorityMutation.mutate({ id: entry.id, priority: entry.priority + 1 })}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => changePriorityMutation.mutate({ id: entry.id, priority: Math.max(0, entry.priority - 1) })}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setAssignTableDialogOpen(true);
                      }}
                    >
                      <Table className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => removeFromQueueMutation.mutate(entry.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </ScrollArea>
        )}
      </CardContent>

      {/* Table Assignment Dialog */}
      <Dialog open={assignTableDialogOpen} onOpenChange={setAssignTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Player to Table</DialogTitle>
            <DialogDescription>
              {selectedEntry?.player.name ? `Assign ${selectedEntry.player.name} to a table` : 'Select a table to assign this player'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="table">Select Table</Label>
              <Select 
                value={selectedTableId} 
                onValueChange={setSelectedTableId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables?.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      {table.name} ({table.gameType} - {table.limits || 'No limits'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignToTable} 
              disabled={!selectedTableId || assignToTableMutation.isPending}
            >
              {assignToTableMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign to Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}