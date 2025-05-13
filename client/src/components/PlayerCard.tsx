import React from 'react';
import { Player, usePokerTable } from '@/context/PokerTableContext';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/timeUtils';
import { PauseIcon, PlayIcon, XCircleIcon, User, Clock, ArrowRightLeft } from 'lucide-react';

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

  // Get status styles
  const getStatusStyles = () => {
    switch(player.status) {
      case 'active':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30',
          icon: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
          iconColor: 'text-green-500'
        };
      case 'inactive':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30',
          icon: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
          iconColor: 'text-red-500'
        };
      case 'waiting':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30',
          icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300',
          iconColor: 'text-amber-500'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          icon: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
          iconColor: 'text-gray-500'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div 
      className={`
        ${styles.bg} rounded-lg p-3 flex items-center justify-between
        hover:shadow-md transition-shadow border
        ${player.status === 'inactive' ? 'opacity-80' : ''}
        cursor-pointer
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-center">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-3 shadow-sm
          ${styles.icon}
        `}>
          {seat || '-'}
        </div>
        <div>
          <div className="flex items-center">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{player.name}</h4>
            <div className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${styles.iconColor} bg-white dark:bg-gray-900 border border-current flex items-center`}>
              {player.status === 'active' ? 'Active' : player.status === 'inactive' ? 'Paused' : 'Waiting'}
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <Clock className="h-3 w-3 mr-1 opacity-70" />
            <span className="font-mono">{formatTime(player.timeElapsed)}</span>
            <span className="mx-1.5 text-gray-300 dark:text-gray-600">•</span>
            <ArrowRightLeft className="h-3 w-3 mr-1 opacity-70" />
            <span>Seat {seat || 'None'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="sm"
          className={`p-1.5 rounded-md h-8 w-8 ${
            player.status === 'active' 
              ? 'text-green-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
              : 'text-red-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}
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
          className="p-1.5 text-gray-500 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8"
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
