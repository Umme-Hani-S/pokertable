import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/timeUtils";
import { useToast } from "@/hooks/use-toast";

// Player Types
export type PlayerStatus = "active" | "inactive" | "waiting" | "empty";

export interface Player {
  id: number;
  name: string;
  status: PlayerStatus;
  seatId: number | null;
  timeJoined: string;
  timeElapsed: number;
  isActive: boolean;
  notes?: string;
}

// Session Types
export interface TableSession {
  id: number;
  name: string;
  isActive: boolean;
  startTime: string;
  endTime: string | null;
  totalTime: number;
}

// Seat Types
export interface TableSeat {
  id: number;
  position: number;
  isActive: boolean;
}

// Context Interface
interface PokerTableContextType {
  // Session state
  sessionActive: boolean;
  sessionTime: number;
  startSession: () => void;
  pauseSession: () => void;
  endSession: () => void;
  
  // Players state
  players: Player[];
  activePlayers: Player[];
  waitingPlayers: Player[];
  isLoadingPlayers: boolean;
  addPlayer: (player: Omit<Player, "id" | "timeJoined" | "timeElapsed" | "isActive">) => void;
  updatePlayer: (id: number, player: Partial<Player>) => void;
  removePlayer: (id: number) => void;
  
  // Seats state
  seats: TableSeat[];
  isLoadingSeats: boolean;
  getPlayerBySeatId: (seatId: number) => Player | undefined;
  assignPlayerToSeat: (playerId: number, seatId: number) => void;
  removePlayerFromSeat: (seatId: number) => void;
  
  // UI state
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  selectedSeat: number | null;
  setSelectedSeat: (seatId: number | null) => void;
  showPlayerDialog: boolean;
  setShowPlayerDialog: (show: boolean) => void;
}

// Create the context with a default value
const PokerTableContext = createContext<PokerTableContextType | undefined>(undefined);

// Provider component
export const PokerTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionInterval, setSessionInterval] = useState<NodeJS.Timeout | null>(null);

  // Players state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);

  // Fetch current session
  const { 
    data: currentSession,
    isLoading: isLoadingSession,
    error: sessionError
  } = useQuery({
    queryKey: ['/api/sessions/current'],
    onSuccess: (data) => {
      if (data) {
        setSessionActive(data.isActive);
        // Calculate the session time based on the start time
        if (data.isActive && data.startTime) {
          const startTime = new Date(data.startTime).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setSessionTime(elapsed);
        }
      }
    },
    onError: () => {
      // If no session exists, don't show an error
    }
  });

  // Fetch players
  const {
    data: players = [],
    isLoading: isLoadingPlayers,
    error: playersError
  } = useQuery<Player[]>({
    queryKey: ['/api/players'],
    refetchInterval: sessionActive ? 5000 : false // Refetch players every 5 seconds during active session
  });

  // Fetch seats
  const {
    data: seats = [],
    isLoading: isLoadingSeats,
    error: seatsError
  } = useQuery<TableSeat[]>({
    queryKey: ['/api/seats']
  });

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: (session: { name: string, isActive: boolean }) => 
      apiRequest('POST', '/api/sessions', session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/current'] });
      toast({
        title: "Session started",
        description: "The poker table session has been started.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to start session",
        description: "There was an error starting the session.",
        variant: "destructive",
      });
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/sessions/current/end'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/current'] });
      toast({
        title: "Session ended",
        description: "The poker table session has been ended.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to end session",
        description: "There was an error ending the session.",
        variant: "destructive",
      });
    }
  });

  const addPlayerMutation = useMutation({
    mutationFn: (player: Omit<Player, "id" | "timeJoined" | "timeElapsed" | "isActive">) => 
      apiRequest('POST', '/api/players', player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Player added",
        description: "The player has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add player",
        description: "There was an error adding the player.",
        variant: "destructive",
      });
    }
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({id, player}: {id: number, player: Partial<Player>}) => 
      apiRequest('PATCH', `/api/players/${id}`, player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    }
  });

  const removePlayerMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/players/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Player removed",
        description: "The player has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove player",
        description: "There was an error removing the player.",
        variant: "destructive",
      });
    }
  });

  const assignPlayerToSeatMutation = useMutation({
    mutationFn: ({ playerId, seatId }: { playerId: number, seatId: number }) => 
      apiRequest('POST', `/api/seats/${seatId}/assign/${playerId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Player seated",
        description: "The player has been assigned to the seat.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to assign seat",
        description: "There was an error assigning the player to the seat.",
        variant: "destructive",
      });
    }
  });

  const removePlayerFromSeatMutation = useMutation({
    mutationFn: (seatId: number) => apiRequest('POST', `/api/seats/${seatId}/remove`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Player removed from seat",
        description: "The player has been removed from the seat.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove from seat",
        description: "There was an error removing the player from the seat.",
        variant: "destructive",
      });
    }
  });

  const updatePlayerTimeMutation = useMutation({
    mutationFn: ({ id, timeElapsed }: { id: number, timeElapsed: number }) => 
      apiRequest('POST', `/api/players/${id}/time`, { timeElapsed }),
    onSuccess: () => {
      // No need to invalidate as we're updating times continuously
    }
  });

  // Filtered players
  const activePlayers = players.filter(p => p.isActive && (p.status === "active" || p.status === "inactive") && p.seatId !== null);
  const waitingPlayers = players.filter(p => p.isActive && p.status === "waiting");

  // Start session
  const startSession = () => {
    // If there's no active session, create one
    if (!currentSession || !currentSession.isActive) {
      createSessionMutation.mutate({
        name: "Main Table",
        isActive: true
      });
    }
    
    setSessionActive(true);
    
    // Start the timer
    if (sessionInterval) clearInterval(sessionInterval);
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
      
      // Update all active players' time elapsed
      activePlayers.forEach(player => {
        if (player.status === "active") {
          updatePlayerTimeMutation.mutate({
            id: player.id,
            timeElapsed: player.timeElapsed + 1
          });
        }
      });
    }, 1000);
    
    setSessionInterval(interval);
  };

  // Pause session
  const pauseSession = () => {
    setSessionActive(false);
    if (sessionInterval) {
      clearInterval(sessionInterval);
      setSessionInterval(null);
    }
  };

  // End session
  const endSession = () => {
    pauseSession();
    endSessionMutation.mutate();
    setSessionTime(0);
  };

  // Add player
  const addPlayer = (player: Omit<Player, "id" | "timeJoined" | "timeElapsed" | "isActive">) => {
    addPlayerMutation.mutate(player);
  };

  // Update player
  const updatePlayer = (id: number, playerUpdate: Partial<Player>) => {
    updatePlayerMutation.mutate({ id, player: playerUpdate });
  };

  // Remove player
  const removePlayer = (id: number) => {
    removePlayerMutation.mutate(id);
  };

  // Get player by seat ID
  const getPlayerBySeatId = (seatId: number): Player | undefined => {
    return players.find(p => p.isActive && p.seatId === seatId);
  };

  // Assign player to seat
  const assignPlayerToSeat = (playerId: number, seatId: number) => {
    assignPlayerToSeatMutation.mutate({ playerId, seatId });
  };

  // Remove player from seat
  const removePlayerFromSeat = (seatId: number) => {
    removePlayerFromSeatMutation.mutate(seatId);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (sessionInterval) clearInterval(sessionInterval);
    };
  }, [sessionInterval]);

  // If there are errors, show toast notifications
  useEffect(() => {
    if (playersError) {
      toast({
        title: "Failed to load players",
        description: "There was an error loading players data.",
        variant: "destructive",
      });
    }
    
    if (seatsError) {
      toast({
        title: "Failed to load seats",
        description: "There was an error loading seats data.",
        variant: "destructive",
      });
    }
  }, [playersError, seatsError, toast]);

  // Context value
  const contextValue: PokerTableContextType = {
    // Session
    sessionActive,
    sessionTime,
    startSession,
    pauseSession,
    endSession,
    
    // Players
    players,
    activePlayers,
    waitingPlayers,
    isLoadingPlayers,
    addPlayer,
    updatePlayer,
    removePlayer,
    
    // Seats
    seats,
    isLoadingSeats,
    getPlayerBySeatId,
    assignPlayerToSeat,
    removePlayerFromSeat,
    
    // UI state
    selectedPlayer,
    setSelectedPlayer,
    selectedSeat,
    setSelectedSeat,
    showPlayerDialog,
    setShowPlayerDialog
  };

  return (
    <PokerTableContext.Provider value={contextValue}>
      {children}
    </PokerTableContext.Provider>
  );
};

// Custom hook to use the context
export const usePokerTable = () => {
  const context = useContext(PokerTableContext);
  if (context === undefined) {
    throw new Error("usePokerTable must be used within a PokerTableProvider");
  }
  return context;
};
