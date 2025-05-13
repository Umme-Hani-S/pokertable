import React, { useState, useEffect } from 'react';
import type { Seat, Player } from '@/../../shared/types';
import { STATUS_COLORS } from '@/../../shared/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import pokerTableImg from '../assets/poker-table.jpg';

// API functions
const fetchSeats = async (): Promise<Seat[]> => {
  const response = await fetch('/api/seats');
  if (!response.ok) throw new Error('Failed to fetch seats');
  return response.json();
};

const fetchPlayers = async (): Promise<Player[]> => {
  const response = await fetch('/api/players');
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json();
};

const updateSeatStatus = async (
  seatId: number, 
  status: string, 
  playerId?: number
): Promise<Seat> => {
  const response = await fetch(`/api/seats/${seatId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, playerId }),
  });
  
  if (!response.ok) throw new Error('Failed to update seat status');
  return response.json();
};

const createPlayer = async (name: string): Promise<Player> => {
  const response = await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) throw new Error('Failed to create player');
  return response.json();
};

const PokerTable: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected seat for status change dialog
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | ''>('');
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [showNewPlayerInput, setShowNewPlayerInput] = useState(false);
  
  // Dealer position (bottom center)
  const dealerPosition = {
    left: 50,
    top: 92,
  };
  
  // Seat positions - exact same layout from design
  const seatPositions = [
    // Seat 1 - LEFT of dealer (bottom left)
    { position: 1, left: 38, top: 87 },
    
    // Seat 2 - left side of table (moved further out)
    { position: 2, left: 10, top: 65 },
    
    // Seat 3 - top left (moved further out)
    { position: 3, left: 10, top: 35 },
    
    // Seat 4 - top left center
    { position: 4, left: 35, top: 15 },
    
    // Seat 5 - directly opposite dealer (top middle)
    { position: 5, left: 50, top: 8 },
    
    // Seat 6 - top right center
    { position: 6, left: 65, top: 15 },
    
    // Seat 7 - top right (moved further out)
    { position: 7, left: 90, top: 35 },
    
    // Seat 8 - right side of table (moved further out)
    { position: 8, left: 90, top: 65 },
    
    // Seat 9 - right of dealer (bottom right)
    { position: 9, left: 62, top: 87 },
  ];
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [seatsData, playersData] = await Promise.all([
          fetchSeats(),
          fetchPlayers()
        ]);
        setSeats(seatsData);
        setPlayers(playersData);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle seat click to open status change dialog
  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setNewStatus(seat.status);
    setSelectedPlayerId(seat.playerId || '');
    setShowNewPlayerInput(false);
    setNewPlayerName('');
    setDialogOpen(true);
  };
  
  // Find player by ID
  const getPlayerById = (id?: number) => {
    if (!id) return null;
    return players.find(player => player.id === id);
  };
  
  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedSeat) return;
    
    try {
      let playerId = undefined;
      
      // If status is 'Playing', we need a player ID
      if (newStatus === 'Playing') {
        if (showNewPlayerInput && newPlayerName.trim()) {
          // Create new player
          const newPlayer = await createPlayer(newPlayerName.trim());
          setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
          playerId = newPlayer.id;
        } else if (selectedPlayerId) {
          playerId = Number(selectedPlayerId);
        } else {
          setError('Please select a player or create a new one');
          return;
        }
      }
      
      // Update seat status
      const updatedSeat = await updateSeatStatus(selectedSeat.id, newStatus, playerId);
      
      // Update the seats state
      setSeats(prevSeats => 
        prevSeats.map(seat => 
          seat.id === updatedSeat.id ? updatedSeat : seat
        )
      );
      
      // Close dialog
      setDialogOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to update seat status. Please try again.');
      console.error(err);
    }
  };
  
  // Find seat by position
  const getSeatByPosition = (position: number) => {
    return seats.find(seat => seat.position === position);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Poker Table Management</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl font-medium">Loading...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Poker Table</h2>
              
              {/* Poker Table with Seats */}
              <div className="aspect-video relative mb-6">
                {/* Using the reference image */}
                <img 
                  src={pokerTableImg} 
                  alt="Poker Table" 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                
                {/* Dealer position */}
                <div 
                  className="absolute w-12 h-12 rounded-full bg-white border-2 border-red-600 shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ 
                    left: `${dealerPosition.left}%`, 
                    top: `${dealerPosition.top}%`,
                  }}
                >
                  <span className="text-red-700 font-bold text-lg">D</span>
                </div>
                
                {/* Seats */}
                <div className="absolute inset-0">
                  {seatPositions.map((position) => {
                    const seat = getSeatByPosition(position.position);
                    if (!seat) return null;
                    
                    const player = getPlayerById(seat.playerId);
                    
                    return (
                      <div 
                        key={position.position}
                        className="absolute w-11 h-11 rounded-full bg-white border-2 shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition-transform"
                        style={{ 
                          left: `${position.left}%`, 
                          top: `${position.top}%`,
                          borderColor: STATUS_COLORS[seat.status],
                          backgroundColor: `${STATUS_COLORS[seat.status]}20`,
                        }}
                        onClick={() => handleSeatClick(seat)}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-bold text-sm">{position.position}</span>
                          {seat.status === 'Playing' && player && (
                            <span className="text-[8px] truncate max-w-[35px]">{player.name}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Seat Status Legend */}
              <div className="flex flex-wrap gap-4 mt-6 border-t pt-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS.Open }}></div>
                  <span>Open</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS.Playing }}></div>
                  <span>Playing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS.Break }}></div>
                  <span>Break</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS.Blocked }}></div>
                  <span>Blocked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS.Closed }}></div>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Seat Status Change Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat {selectedSeat?.position} - Change Status</DialogTitle>
            <DialogDescription>
              Update the status of this seat
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Playing">Playing</SelectItem>
                  <SelectItem value="Break">Break</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Player selection for Playing status */}
            {newStatus === 'Playing' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="newPlayer" 
                    checked={showNewPlayerInput}
                    onChange={e => setShowNewPlayerInput(e.target.checked)}
                    className="form-checkbox"
                  />
                  <Label htmlFor="newPlayer">Add new player</Label>
                </div>
                
                {showNewPlayerInput ? (
                  <div className="space-y-2">
                    <Label htmlFor="newPlayerName">New Player Name</Label>
                    <Input 
                      id="newPlayerName" 
                      value={newPlayerName} 
                      onChange={e => setNewPlayerName(e.target.value)} 
                      placeholder="Enter player name"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="playerId">Select Player</Label>
                    <Select 
                      value={selectedPlayerId ? String(selectedPlayerId) : ''} 
                      onValueChange={val => setSelectedPlayerId(val ? Number(val) : '')}
                    >
                      <SelectTrigger id="playerId">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map(player => (
                          <SelectItem key={player.id} value={String(player.id)}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange}>
                Update Seat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PokerTable;