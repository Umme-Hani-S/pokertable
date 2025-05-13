import React, { useState } from 'react';
import { Player, usePokerTable } from '@/context/PokerTableContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatTime } from '@/lib/timeUtils';
import { PlayIcon, PauseIcon, ArrowLeftRightIcon, LogOutIcon, XIcon } from 'lucide-react';

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
    setShowPlayerDialog 
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

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Player Actions</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center font-semibold text-lg mr-4">
            {player.seatId || '-'}
          </div>
          <div>
            <h4 className="text-lg font-medium">{player.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Session time: <span className="font-mono">{formatTime(player.timeElapsed)}</span>
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            variant="default"
            className={`py-3 px-4 bg-green-500 hover:bg-green-600 transition-colors flex flex-col items-center justify-center ${player.status === 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleStatusChange('active')}
            disabled={player.status === 'active'}
          >
            <PlayIcon className="h-5 w-5 mb-1" />
            Resume
          </Button>
          
          <Button 
            variant="outline"
            className={`py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center ${player.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleStatusChange('inactive')}
            disabled={player.status === 'inactive'}
          >
            <PauseIcon className="h-5 w-5 mb-1" />
            Pause
          </Button>
          
          <Button 
            variant="outline"
            className="py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center"
            onClick={onClose}
          >
            <ArrowLeftRightIcon className="h-5 w-5 mb-1" />
            Move Seat
          </Button>
          
          <Button 
            variant="destructive"
            className="py-3 px-4 flex flex-col items-center justify-center"
            onClick={handleCheckOut}
          >
            <LogOutIcon className="h-5 w-5 mb-1" />
            Check Out
          </Button>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
          <div className="mb-4">
            <label htmlFor="playerNotes" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Notes
            </label>
            <Textarea
              id="playerNotes"
              rows={2}
              placeholder="Add notes about this player..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="default"
              className="bg-indigo-500 hover:bg-indigo-600"
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
