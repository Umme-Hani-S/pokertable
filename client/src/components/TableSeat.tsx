import React from 'react';
import { Player } from '@/context/PokerTableContext';
import { formatTime } from '@/lib/timeUtils';
import { TableSeat as TableSeatType } from '@/context/PokerTableContext';
import { PlusIcon } from 'lucide-react';

interface SeatPosition {
  position: number;
  top: string;
  left: string;
}

interface TableSeatProps {
  seat: TableSeatType;
  player?: Player;
  position: SeatPosition;
  onClick: () => void;
}

const TableSeat: React.FC<TableSeatProps> = ({ seat, player, position, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500';
      case 'inactive': return 'border-red-500';
      case 'waiting': return 'border-amber-500';
      default: return 'border-gray-300';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-red-500';
      case 'waiting': return 'text-amber-500';
      default: return 'text-gray-500';
    }
  };

  const isEmpty = !player;

  return (
    <div 
      className="seat seat-animation cursor-pointer absolute w-[70px] h-[70px] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
      style={{ top: position.top, left: position.left }}
      onClick={onClick}
      data-seat-id={seat.id}
      data-status={player?.status || 'empty'}
    >
      <div 
        className={`
          ${isEmpty ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} 
          rounded-full w-full h-full flex flex-col items-center justify-center shadow-md 
          border-4 ${isEmpty ? 'border-gray-300 dark:border-gray-600' : getStatusColor(player.status)} 
          text-center
        `}
      >
        {isEmpty ? (
          <>
            <PlusIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Empty</span>
          </>
        ) : (
          <>
            <span className="text-sm font-medium truncate max-w-[80%]">{player.name}</span>
            <span className={`text-xs ${getStatusTextColor(player.status)}`}>
              {player.status === 'waiting' ? 'Waiting' : formatTime(player.timeElapsed)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TableSeat;
