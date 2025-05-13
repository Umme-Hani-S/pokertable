import React from 'react';
import { usePokerTable } from '@/context/PokerTableContext';
import TableSeat from './TableSeat';
import { formatTime } from '@/lib/timeUtils';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define seat positions around the table
const SEAT_POSITIONS = [
  { position: 1, top: '10%', left: '50%' },
  { position: 2, top: '22%', left: '80%' },
  { position: 3, top: '50%', left: '90%' },
  { position: 4, top: '78%', left: '80%' },
  { position: 5, top: '90%', left: '50%' },
  { position: 6, top: '78%', left: '20%' },
  { position: 7, top: '50%', left: '10%' },
  { position: 8, top: '22%', left: '20%' },
];

const PokerTableVisualization: React.FC = () => {
  const { 
    sessionActive, 
    sessionTime, 
    seats, 
    isLoadingSeats, 
    getPlayerBySeatId,
    setSelectedSeat,
    setSelectedPlayer,
    setShowPlayerDialog
  } = usePokerTable();

  const handleSeatClick = (seatId: number) => {
    setSelectedSeat(seatId);
    const player = getPlayerBySeatId(seatId);
    
    if (player) {
      setSelectedPlayer(player);
      setShowPlayerDialog(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto relative">
      <div className="mb-4 flex justify-center w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-2 flex items-center">
          <span className="mr-2 font-medium">Table Status:</span>
          <span 
            className={`font-semibold flex items-center ${
              sessionActive ? 'text-green-500' : 'text-amber-500'
            }`}
          >
            <span className="mr-1 flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sessionActive ? 'bg-green-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${sessionActive ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            </span>
            {sessionActive ? 'Active' : 'Paused'}
          </span>
          
          <span className="mx-3 text-gray-300">|</span>
          <span className="mr-2 font-medium">Session Time:</span>
          <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">
            {formatTime(sessionTime)}
          </span>
        </div>
      </div>
      
      <div className="poker-table w-full max-w-[500px] aspect-square relative mx-auto flex-shrink-0 bg-primary dark:bg-green-700 shadow-lg rounded-full border-[10px] border-primary-dark dark:border-green-800">
        {!isLoadingSeats && seats.map((seat) => {
          const position = SEAT_POSITIONS.find(pos => pos.position === seat.position);
          if (!position) return null;
          
          const player = getPlayerBySeatId(seat.id);
          
          return (
            <TableSeat 
              key={seat.id}
              seat={seat}
              player={player}
              position={position}
              onClick={() => handleSeatClick(seat.id)}
            />
          );
        })}
        
        {/* Table Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-primary-dark/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            Main Table
          </div>
        </div>
      </div>

      {/* Dealer Action Button */}
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
        <Button 
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center p-0"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default PokerTableVisualization;
