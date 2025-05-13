import React from 'react';
import { Player } from '@/context/PokerTableContext';
import { formatTime } from '@/lib/timeUtils';
import { TableSeat as TableSeatType } from '@/context/PokerTableContext';
import { PlusIcon, ClockIcon, UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

  const getGlowStyles = () => {
    if (!player) return '';
    
    switch (player.status) {
      case 'active':
        return 'shadow-[0_0_15px_rgba(34,197,94,0.5)]';
      case 'inactive':
        return 'shadow-[0_0_15px_rgba(244,63,94,0.5)]';
      case 'waiting':
        return 'shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      default:
        return '';
    }
  };

  const isEmpty = !player;

  return (
    <div 
      className={`seat seat-animation cursor-pointer absolute w-[75px] h-[75px] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${getGlowStyles()}`}
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
          text-center card-hover
        `}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center">
            <div className="flex justify-center items-center bg-gray-300 dark:bg-gray-600 h-9 w-9 rounded-full mb-1">
              <PlusIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </div>
            <div className="bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Seat {seat.position}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <Avatar className="h-9 w-9 border-2 border-gray-300 dark:border-gray-600 mb-1">
              <AvatarFallback className="bg-indigo-700 text-white text-xs font-semibold">
                {player.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold truncate max-w-[85%]">{player.name}</span>
            <div className={`text-[10px] flex items-center mt-0.5 ${getStatusTextColor(player.status)}`}>
              {player.status === 'waiting' ? (
                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-100 rounded-full text-[9px]">
                  Waiting
                </span>
              ) : (
                <>
                  <ClockIcon className="h-2.5 w-2.5 mr-0.5" />
                  <span>{formatTime(player.timeElapsed)}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableSeat;
