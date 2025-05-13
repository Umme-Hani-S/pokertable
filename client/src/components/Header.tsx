import React from 'react';
import { usePokerTable } from '@/context/PokerTableContext';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, TimerIcon, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { 
    sessionActive, 
    startSession, 
    pauseSession 
  } = usePokerTable();

  return (
    <header className="bg-surface border-b border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <TimerIcon className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-xl font-semibold">Poker Table Timer</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="default"
          className={sessionActive ? "bg-primary hover:bg-primary-dark" : "bg-primary hover:bg-primary-dark"}
          onClick={sessionActive ? pauseSession : startSession}
        >
          {sessionActive ? (
            <>
              <PauseIcon className="h-4 w-4 mr-1" />
              <span>Pause Session</span>
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4 mr-1" />
              <span>Start Session</span>
            </>
          )}
        </Button>
        
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
