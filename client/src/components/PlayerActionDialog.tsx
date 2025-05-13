import React, { useState } from 'react';
import { Player, usePokerTable } from '@/context/PokerTableContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatTime } from '@/lib/timeUtils';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowLeftRightIcon, 
  LogOutIcon, 
  XIcon,
  Clock,
  DollarSign,
  User,
  Calendar
} from 'lucide-react';

interface PlayerActionDialogProps {
  player: Player;
  onClose: () => void;
}

const PlayerActionDialog: React.FC<PlayerActionDialogProps> = ({ player, onClose }) => {
  const [notes, setNotes] = useState(player.notes || '');
  
  const { 
    updatePlayer, 
    removePlayerFromSeat,
    removePlayer,
    setShowPlayerDialog,
    seats,
    getPlayerBySeatId
  } = usePokerTable();

  const handleStatusChange = (status: 'active' | 'inactive') => {
    updatePlayer(player.id, { status });
    onClose();
  };

  const handleCheckOut = () => {
    if (player.seatId) {
      removePlayerFromSeat(player.seatId);
    }
    removePlayer(player.id);
    onClose();
  };

  const handleSaveNotes = () => {
    updatePlayer(player.id, { notes });
    onClose();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'waiting': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  // Format time for display
  const joinTime = new Date(player.timeJoined);
  const joinTimeString = joinTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 shadow-xl border-none">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <DialogTitle className="flex items-center text-xl font-bold">
            <User className="h-5 w-5 mr-2 text-indigo-500" />
            Player Actions
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex items-center mb-4">
          <div className={`w-16 h-16 rounded-full ${getStatusColor(player.status)} flex items-center justify-center font-bold text-xl text-white mr-4 shadow-lg`}>
            {player.seatId || '-'}
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{player.name}</h4>
            <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span className="font-medium mr-2">Time:</span>
              <span className="font-mono">{formatTime(player.timeElapsed)}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="font-medium mr-2">Joined:</span>
              <span>{joinTimeString}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            variant="default"
            className={`py-6 px-4 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all shadow-md flex flex-col items-center justify-center ${player.status === 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleStatusChange('active')}
            disabled={player.status === 'active'}
          >
            <PlayIcon className="h-6 w-6 mb-2" />
            <span className="font-medium">Resume Player</span>
          </Button>
          
          <Button 
            variant="outline"
            className={`py-6 px-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-orange-200 hover:to-orange-300 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all shadow-md flex flex-col items-center justify-center ${player.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleStatusChange('inactive')}
            disabled={player.status === 'inactive'}
          >
            <PauseIcon className="h-6 w-6 mb-2" />
            <span className="font-medium">Pause Player</span>
          </Button>
          
          <Button 
            variant="outline"
            className="py-6 px-4 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-indigo-200 hover:to-indigo-300 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all shadow-md flex flex-col items-center justify-center"
            onClick={onClose}
          >
            <ArrowLeftRightIcon className="h-6 w-6 mb-2" />
            <span className="font-medium">Move Seat</span>
          </Button>
          
          <Button 
            variant="destructive"
            className="py-6 px-4 bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 transition-all shadow-md flex flex-col items-center justify-center"
            onClick={handleCheckOut}
          >
            <LogOutIcon className="h-6 w-6 mb-2" />
            <span className="font-medium">Check Out</span>
          </Button>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
          <div className="mb-4">
            <label htmlFor="playerNotes" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Player Notes
            </label>
            <Textarea
              id="playerNotes"
              rows={2}
              placeholder="Add notes about this player..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="default"
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md"
              onClick={handleSaveNotes}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerActionDialog;
