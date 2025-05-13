import React from 'react';
import { Player, usePokerTable } from '@/context/PokerTableContext';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/timeUtils';
import { PauseIcon, PlayIcon, XCircleIcon } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  seat?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, seat }) => {
  const { 
    updatePlayer, 
    removePlayerFromSeat,
    setSelectedPlayer,
    setShowPlayerDialog
  } = usePokerTable();

  const handlePauseResume = () => {
    const newStatus = player.status === 'active' ? 'inactive' : 'active';
    updatePlayer(player.id, { status: newStatus });
  };

  const handleRemove = () => {
    if (player.seatId) {
      removePlayerFromSeat(player.seatId);
    }
  };

  const handleCardClick = () => {
    setSelectedPlayer(player);
    setShowPlayerDialog(true);
  };

  return (
    <div 
      className={`
        bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex items-center justify-between
        ${player.status === 'inactive' ? 'opacity-60' : ''}
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-center">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3
          ${player.status === 'active' 
            ? 'bg-green-100 dark:bg-green-900 text-green-500' 
            : player.status === 'inactive' 
              ? 'bg-red-100 dark:bg-red-900 text-red-500' 
              : 'bg-amber-100 dark:bg-amber-900 text-amber-500'
          }
        `}>
          {seat || '-'}
        </div>
        <div>
          <h4 className="font-medium">{player.name}</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Seat {seat || 'None'} • <span className="font-mono">{formatTime(player.timeElapsed)}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="sm"
          className="p-1.5 text-gray-500 hover:text-indigo-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            handlePauseResume();
          }}
        >
          {player.status === 'active' ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="p-1.5 text-gray-500 hover:text-red-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
        >
          <XCircleIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerCard;
