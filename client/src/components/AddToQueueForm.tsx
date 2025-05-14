import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

interface AddToQueueFormProps {
  clubId: number;
  defaultTableId?: number;
  onSuccess?: () => void;
}

// Define the form schema
const formSchema = z.object({
  playerId: z.string().min(1, "Player is required"),
  tableId: z.string().optional(),
  priority: z.string().transform(val => parseInt(val)).default("0"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Player type definition
type Player = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
};

type Table = {
  id: number;
  name: string;
  clubId: number;
  gameType: string;
  limits?: string;
};

export function AddToQueueForm({ clubId, defaultTableId, onSuccess }: AddToQueueFormProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  // Query club players
  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['/api/clubs', clubId, 'players'],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}/players`).then(res => res.json()),
    enabled: !!clubId,
  });

  // Query club tables
  const { data: tables, isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ['/api/clubs', clubId, 'tables'],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}/tables`).then(res => res.json()),
    enabled: !!clubId,
  });

  // Query player limits
  const { data: playerLimits } = useQuery<{hasReachedLimit: boolean, currentCount: number, maxCount: number}>({
    queryKey: ['/api/clubs', clubId, 'check-player-limit'],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}/check-player-limit`).then(res => res.json()),
    enabled: !!clubId,
  });
  
  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerId: '',
      tableId: defaultTableId ? defaultTableId.toString() : '',
      priority: '0',
      notes: '',
    },
  });

  // Add to queue mutation
  const addToQueueMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        playerId: parseInt(values.playerId),
        tableId: values.tableId ? parseInt(values.tableId) : undefined,
        priority: parseInt(values.priority),
        notes: values.notes,
        status: 'waiting',
      };
      
      const res = await apiRequest('POST', `/api/clubs/${clubId}/queue`, payload);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add player to queue');
      }
      
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/clubs', clubId, 'queue'] });
      if (defaultTableId) {
        queryClient.invalidateQueries({ queryKey: ['/api/tables', defaultTableId, 'queue'] });
      }
      toast({
        title: 'Player added to queue',
        description: 'The player has been added to the queue successfully.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add player',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (values: FormValues) => {
    addToQueueMutation.mutate(values);
  };

  const hasReachedLimit = playerLimits?.hasReachedLimit;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Add to Queue</CardTitle>
            <CardDescription>
              {hasReachedLimit 
                ? `Player limit reached (${playerLimits?.currentCount}/${playerLimits?.maxCount})`
                : 'Add a player to the waiting queue'}
            </CardDescription>
          </div>
          {!showForm && (
            <Button 
              variant="outline" 
              onClick={() => setShowForm(true)}
              disabled={hasReachedLimit}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Player
            </Button>
          )}
        </div>
      </CardHeader>

      {showForm && (
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a player" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {playersLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          players?.map((player) => (
                            <SelectItem key={player.id} value={player.id.toString()}>
                              {player.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific table</SelectItem>
                        {tablesLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          tables?.map((table) => (
                            <SelectItem key={table.id} value={table.id.toString()}>
                              {table.name} ({table.gameType})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can optionally assign to a specific table's queue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Higher numbers have higher priority (default: 0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special requirements or notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addToQueueMutation.isPending}>
                  {addToQueueMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add to Queue
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  );
}