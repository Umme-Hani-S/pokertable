import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePokerTable } from '@/context/PokerTableContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Form validation schema
const playerFormSchema = z.object({
  name: z.string().min(1, 'Player name is required'),
  seatId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'waiting']),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

interface AddPlayerFormProps {
  initialStatus?: 'active' | 'inactive' | 'waiting';
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ initialStatus = 'active' }) => {
  const { addPlayer, seats, getPlayerBySeatId } = usePokerTable();

  // Get available seats (those without a player)
  const availableSeats = seats.filter(seat => !getPlayerBySeatId(seat.id));

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: '',
      seatId: 'none',
      status: initialStatus,
    },
  });

  const onSubmit = (data: PlayerFormValues) => {
    const seatId = data.seatId && data.seatId !== 'none' ? parseInt(data.seatId) : null;
    
    addPlayer({
      name: data.name,
      status: data.status,
      seatId,
      notes: '',
    });

    // Reset the form
    form.reset({
      name: '',
      seatId: 'none',
      status: initialStatus,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Player Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter player name" 
                  {...field} 
                  className="text-sm" 
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {initialStatus !== 'waiting' && (
          <FormField
            control={form.control}
            name="seatId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Seat Assignment
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select seat number" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No seat (waiting list)</SelectItem>
                    {availableSeats.map(seat => (
                      <SelectItem key={seat.id} value={seat.id.toString()}>
                        Seat {seat.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        <Button 
          type="submit" 
          className={`w-full ${
            initialStatus === 'waiting' 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          {initialStatus === 'waiting' ? 'Add to Waiting List' : 'Add Player'}
        </Button>
      </form>
    </Form>
  );
};

export default AddPlayerForm;
