import React, { useState } from 'react';
import type { Player } from '@/../../shared/types';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { cn } from '../lib/utils';

interface PlayerSearchSelectProps {
  players: Player[];
  selectedPlayerId: number | '';
  onSelect: (playerId: number) => void;
  placeholder?: string;
}

const PlayerSearchSelect: React.FC<PlayerSearchSelectProps> = ({
  players,
  selectedPlayerId,
  onSelect,
  placeholder = "Select player"
}) => {
  const [open, setOpen] = useState(false);
  
  const selectedPlayer = players.find(player => player.id === selectedPlayerId);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPlayer ? selectedPlayer.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search players..." className="h-9" />
          <CommandEmpty>No player found.</CommandEmpty>
          <CommandGroup>
            {players.map((player) => (
              <CommandItem
                key={player.id}
                value={player.name}
                onSelect={() => {
                  onSelect(player.id);
                  setOpen(false);
                }}
              >
                {player.name}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedPlayerId === player.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PlayerSearchSelect;