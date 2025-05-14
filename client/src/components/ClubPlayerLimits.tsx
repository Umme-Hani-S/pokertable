import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Settings, FileEdit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Progress } from '@/components/ui/progress';

interface ClubPlayerLimitsProps {
  clubId: number;
}

type PlayerLimits = {
  id: number;
  clubId: number;
  maxPlayers: number;
  currentPlayers: number;
  updatedAt: string;
  updatedBy?: number;
};

// Define form schema
const formSchema = z.object({
  maxPlayers: z.string()
    .transform(val => parseInt(val))
    .refine(val => val >= 1, {
      message: "Maximum players must be at least 1",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function ClubPlayerLimits({ clubId }: ClubPlayerLimitsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Query for player limits
  const { 
    data: playerLimits, 
    isLoading, 
    error 
  } = useQuery<PlayerLimits>({
    queryKey: ['/api/clubs', clubId, 'player-limits'],
    queryFn: () => apiRequest('GET', `/api/clubs/${clubId}/player-limits`).then(res => res.json()),
    enabled: !!clubId,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxPlayers: playerLimits?.maxPlayers.toString() || '50',
    },
    values: {
      maxPlayers: playerLimits?.maxPlayers.toString() || '50',
    },
  });

  // When player limits data loads, update form values
  useEffect(() => {
    if (playerLimits) {
      form.setValue('maxPlayers', playerLimits.maxPlayers.toString());
    }
  }, [playerLimits, form]);

  // Mutation for updating player limits
  const updateLimitsMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // For new limits, use POST, for updating existing limits, use PUT
      const method = playerLimits?.id ? 'PUT' : 'POST';
      
      const res = await apiRequest(
        method, 
        `/api/clubs/${clubId}/player-limits`, 
        { maxPlayers: values.maxPlayers }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update player limits');
      }
      
      return res.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/clubs', clubId, 'player-limits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clubs', clubId, 'check-player-limit'] });
      toast({
        title: 'Player limits updated',
        description: 'The player limits have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update player limits',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (values: FormValues) => {
    updateLimitsMutation.mutate(values);
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Player Limits</CardTitle>
          <CardDescription>Loading player limits data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Player Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercent = playerLimits ? 
    Math.min(100, Math.round((playerLimits.currentPlayers / playerLimits.maxPlayers) * 100)) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Player Limits</CardTitle>
            <CardDescription>
              Club player allocation limits and usage
            </CardDescription>
          </div>
          {isAdmin && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <FileEdit className="h-4 w-4 mr-1" />
              Edit Limits
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && isAdmin ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="maxPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Players</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateLimitsMutation.isPending}
                >
                  {updateLimitsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Usage</p>
                <p className="text-2xl font-bold">
                  {playerLimits?.currentPlayers} / {playerLimits?.maxPlayers}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary">
                <p className="text-xl font-bold">{usagePercent}%</p>
              </div>
            </div>
            
            <Progress value={usagePercent} className="h-2" />
            
            <div className="pt-2 text-xs text-muted-foreground">
              <p>
                Last updated: {playerLimits?.updatedAt ? 
                  new Date(playerLimits.updatedAt).toLocaleString() : 
                  'Never'
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}