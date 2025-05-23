import React, { useState, useEffect, useCallback } from 'react';
import type { Seat, Player, SeatStatus } from '@/../../shared/types';
import { STATUS_COLORS } from '@/../../shared/types';
import { timeTracker } from '../lib/timeTracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AutocompleteSelect from './AutocompleteSelect';
import pokerTableImg from '../assets/poker-table.jpg';

import { apiRequest } from '@/lib/queryClient';

// API functions
const fetchSeats = async (tableId: number = 1): Promise<Seat[]> => {
  try {
    const response = await apiRequest('GET', `/api/tables/${tableId}/seats`);
    return response.json();
  } catch (error) {
    console.error('Error fetching seats:', error);
    throw error;
  }
};

const fetchPlayers = async (clubId: number = 1): Promise<Player[]> => {
  try {
    const response = await apiRequest('GET', `/api/clubs/${clubId}/players`);
    return response.json();
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

const updateSeatStatus = async (
  seatId: number, 
  status: string, 
  playerId?: number
): Promise<Seat> => {
  try {
    const response = await apiRequest(
      'PATCH',
      `/api/seats/${seatId}`,
      { status, playerId }
    );
    return response.json();
  } catch (error) {
    console.error('Error updating seat status:', error);
    throw error;
  }
};

const createPlayer = async (name: string, clubId: number): Promise<Player> => {
  try {
    const response = await apiRequest(
      'POST',
      `/api/clubs/${clubId}/players`,
      { name, clubId }
    );
    return response.json();
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

interface PokerTableProps {
  tableId: number;
  clubId: number;
}

const PokerTable: React.FC<PokerTableProps> = ({ tableId, clubId }) => {
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeDisplay, setTimeDisplay] = useState<{[key: number]: string}>({});
  
  // Selected seat for status change dialog
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | ''>('');
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [showNewPlayerInput, setShowNewPlayerInput] = useState(false);
  const [showPlayerTimes, setShowPlayerTimes] = useState(false);
  
  // Dealer position (bottom center)
  const dealerPosition = {
    left: 50,
    top: 92,
  };
  
  // Seat positions - exact same layout from design with adjusted positions for 1, 9, 4, 6
  const seatPositions = [
    // Seat 1 - LEFT of dealer (bottom left) - moved further out
    { position: 1, left: 33, top: 87 },
    
    // Seat 2 - left side of table (moved further out)
    { position: 2, left: 10, top: 65 },
    
    // Seat 3 - top left (moved further out)
    { position: 3, left: 10, top: 35 },
    
    // Seat 4 - top left center - moved further out
    { position: 4, left: 30, top: 15 },
    
    // Seat 5 - directly opposite dealer (top middle)
    { position: 5, left: 50, top: 8 },
    
    // Seat 6 - top right center - moved further out
    { position: 6, left: 70, top: 15 },
    
    // Seat 7 - top right (moved further out)
    { position: 7, left: 90, top: 35 },
    
    // Seat 8 - right side of table (moved further out)
    { position: 8, left: 90, top: 65 },
    
    // Seat 9 - right of dealer (bottom right) - moved further out
    { position: 9, left: 67, top: 87 },
  ];
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [seatsData, playersData] = await Promise.all([
          fetchSeats(tableId),
          fetchPlayers(clubId)
        ]);
        setSeats(seatsData);
        setPlayers(playersData);
        
        // Initialize time tracking for any players already in Playing status
        seatsData.forEach(seat => {
          if (seat.status === 'Playing' && seat.playerId) {
            timeTracker.startTracking(seat.playerId);
          }
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [tableId, clubId]);
  
  // Update player times every second
  useEffect(() => {
    // Initial time update
    const updateTimes = () => {
      const times: {[key: number]: string} = {};
      
      // Get times for all active players
      players.forEach(player => {
        const timeStr = timeTracker.getFormattedTime(player.id);
        times[player.id] = timeStr;
      });
      
      setTimeDisplay(times);
    };
    
    // Update times immediately
    updateTimes();
    
    // Set up interval for updating times
    const intervalId = setInterval(updateTimes, 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [players]);
  
  // Get available status options based on current status
  const getAvailableStatusOptions = (currentStatus: string): string[] => {
    // Always include the current status first
    switch (currentStatus) {
      case 'Open':
        return ['Open', 'Playing', 'Blocked', 'Closed'];
      case 'Playing':
        return ['Playing', 'Break', 'Open', 'Closed'];
      case 'Break':
        return ['Break', 'Playing', 'Open', 'Closed'];
      case 'Blocked':
        return ['Blocked', 'Playing', 'Open', 'Closed']; // Updated to allow Blocked -> Playing
      case 'Closed':
        return ['Closed', 'Open'];
      default:
        return [];
    }
  };

  // Handle seat click to open status change dialog
  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    // Always set the current status as initial selection
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
  
  // Handle status change with time tracking
  const handleStatusChange = async () => {
    if (!selectedSeat) return;
    
    try {
      let playerId = undefined;
      
      // Handle different status transitions
      if (newStatus === 'Playing') {
        // For Playing status, handle player assignment
        if (selectedSeat.status === 'Playing') {
          // Keep the current player
          playerId = selectedSeat.playerId;
        }
        // For Break or Blocked seats, keep the same player when transitioning to Playing
        else if ((selectedSeat.status === 'Break' || selectedSeat.status === 'Blocked') && selectedSeat.playerId) {
          playerId = selectedSeat.playerId;
        } 
        // For Open seats, require player selection from UI
        else if (selectedSeat.status === 'Open') {
          if (showNewPlayerInput && newPlayerName.trim()) {
            // Create new player with club ID
            const newPlayer = await createPlayer(newPlayerName.trim(), clubId);
            setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
            playerId = newPlayer.id;
          } else if (selectedPlayerId) {
            playerId = Number(selectedPlayerId);
          } else {
            setError('Please select a player or create a new one');
            return;
          }
        } else {
          setError('Cannot determine player for this transition');
          return;
        }
      } else if (newStatus === 'Break' || newStatus === 'Blocked') {
        // For Break or Blocked, keep the current player ID if transitioning from Playing
        if (selectedSeat.status === 'Playing' && selectedSeat.playerId) {
          playerId = selectedSeat.playerId;
        }
        // Otherwise, playerId remains undefined and will be cleared
      }
      // For Open or Closed, playerId should be undefined
      
      // Check for player status change for time tracking
      const currentPlayer = selectedSeat.playerId;
      
      // Update seat status
      const updatedSeat = await updateSeatStatus(selectedSeat.id, newStatus, playerId);
      
      // Handle time tracking based on status changes
      
      // Case 1: Switching players or removing a player
      if (currentPlayer && currentPlayer !== playerId) {
        // Previous player is no longer in this seat, stop their timer
        timeTracker.stopTracking(currentPlayer);
      }
      
      // Case 2: Status is changing
      if (selectedSeat.status !== newStatus) {
        if (newStatus === 'Playing' && playerId) {
          // Starting to play - start timer for the player
          timeTracker.startTracking(playerId);
        } else if (selectedSeat.status === 'Playing' && currentPlayer) {
          // Was playing, now something else - stop the timer
          timeTracker.stopTracking(currentPlayer);
        }
      } 
      // Case 3: Status remains "Playing" but player is changing
      else if (newStatus === 'Playing' && selectedSeat.status === 'Playing' && playerId !== currentPlayer) {
        if (playerId) {
          // Start timing for the new player
          timeTracker.startTracking(playerId);
        }
      }
      
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
                          borderColor: STATUS_COLORS[seat.status as SeatStatus],
                          backgroundColor: `${STATUS_COLORS[seat.status as SeatStatus]}CC`, // CC is 80% opacity in hex
                        }}
                        onClick={() => handleSeatClick(seat)}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-bold text-sm text-black">{position.position}</span>
                          {/* Display player name for both Playing and Break status */}
                          {(seat.status === 'Playing' || seat.status === 'Break' || seat.status === 'Blocked') && player && (
                            <span className="text-[8px] text-black font-semibold truncate max-w-[35px]">{player.name}</span>
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
              
              {/* Player Times Section */}
              <div className="mt-8 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Player Times</h3>
                  <Button 
                    variant="outline"
                    onClick={() => setShowPlayerTimes(!showPlayerTimes)}
                  >
                    {showPlayerTimes ? 'Hide Times' : 'Show Times'}
                  </Button>
                </div>
                
                {showPlayerTimes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map(player => {
                      // Get the seat this player is assigned to, if any
                      const playerSeat = seats.find(seat => seat.playerId === player.id);
                      const isActive = playerSeat?.status === 'Playing';
                      
                      return (
                        <div 
                          key={player.id} 
                          className={`p-4 rounded-md border ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{player.name}</h4>
                              <p className="text-sm text-gray-600">
                                {playerSeat 
                                  ? `Seat #${playerSeat.position} - ${playerSeat.status}` 
                                  : 'Not seated'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-lg font-mono ${isActive ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                                {timeDisplay[player.id] || '00:00:00'}
                              </span>
                              <p className="text-xs text-gray-500">
                                {isActive ? 'Active' : 'Inactive'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  {selectedSeat && getAvailableStatusOptions(selectedSeat.status).map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Player selection - only show when no player is assigned yet */}
            {newStatus === 'Playing' && selectedSeat?.status === 'Open' && (
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
                    <AutocompleteSelect
                      items={players}
                      selectedId={selectedPlayerId}
                      onSelect={(id: number) => setSelectedPlayerId(id)}
                      placeholder="Type to search players..."
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Display current player when seat has a player (Break, Blocked, Playing) */}
            {selectedSeat && selectedSeat.playerId && (
              <div className={`mt-2 p-3 rounded border ${
                selectedSeat.status === 'Break' ? 'bg-orange-50 border-orange-200' : 
                selectedSeat.status === 'Blocked' ? 'bg-red-50 border-red-200' : 
                'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-sm font-medium">
                  {selectedSeat.status === 'Break' ? 'Player on break: ' : 
                   selectedSeat.status === 'Blocked' ? 'Seat blocked by: ' : 
                   'Current player: '}
                  <span className="font-bold">{getPlayerById(selectedSeat.playerId)?.name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSeat.status === 'Break' ? 'Time paused while on break' : 
                   selectedSeat.status === 'Blocked' ? 'Seat blocked by this player' : 
                   'Currently playing'}
                </p>
                {selectedSeat.status === 'Playing' || selectedSeat.status === 'Break' ? (
                  <p className="text-xs font-medium mt-1">
                    Time at table: {timeDisplay[selectedSeat.playerId] || '00:00:00'}
                  </p>
                ) : null}
              </div>
            )}
            
            {/* Special messages for status transitions with existing players */}
            {selectedSeat && selectedSeat.playerId && (
              <>
                {/* Going from Break/Blocked to Playing */}
                {(selectedSeat.status === 'Blocked' || selectedSeat.status === 'Break') && 
                  newStatus === 'Playing' && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium">
                      Player: <span className="font-bold">{getPlayerById(selectedSeat.playerId)?.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedSeat.status === 'Break' 
                        ? 'Timer will resume when player returns from break' 
                        : 'Timer will restart when player returns to playing'}
                    </p>
                  </div>
                )}
                
                {/* Going from Playing to Break */}
                {selectedSeat.status === 'Playing' && newStatus === 'Break' && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm font-medium">
                      Player going on break: <span className="font-bold">{getPlayerById(selectedSeat.playerId)?.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Timer will pause while player is on break
                    </p>
                  </div>
                )}
                
                {/* Going from Playing to Blocked */}
                {selectedSeat.status === 'Playing' && newStatus === 'Blocked' && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium">
                      Blocking seat for: <span className="font-bold">{getPlayerById(selectedSeat.playerId)?.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Timer will pause while seat is blocked
                    </p>
                  </div>
                )}
              </>
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