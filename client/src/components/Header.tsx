import React from 'react';
import { usePokerTable } from '@/context/PokerTableContext';
import { Button } from '@/components/ui/button';
import { 
  PlayIcon, 
  PauseIcon, 
  TimerIcon, 
  Settings, 
  MoonIcon, 
  SunIcon, 
  Users,
  Download,
  Clock
} from 'lucide-react';
import { formatTime } from '@/lib/timeUtils';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const { 
    sessionActive, 
    startSession, 
    pauseSession,
    sessionTime,
    activePlayers,
    waitingPlayers
  } = usePokerTable();

  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 border-b border-indigo-700 dark:border-indigo-800 py-3 px-4 sm:px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="bg-white p-2 rounded-lg shadow-md mr-3">
            <TimerIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">Poker Table Timer</h1>
          
          <div className="hidden md:flex ml-6 space-x-3">
            <div className="bg-white/10 text-white rounded-md px-3 py-1 text-sm flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(sessionTime)}
            </div>
            <div className="bg-white/10 text-white rounded-md px-3 py-1 text-sm flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {activePlayers.length + waitingPlayers.length} players
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 sm:ml-auto">
          <Button 
            variant="default"
            className={sessionActive 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-green-500 hover:bg-green-600 text-white"
            }
            onClick={sessionActive ? pauseSession : startSession}
            size="lg"
          >
            {sessionActive ? (
              <>
                <PauseIcon className="h-4 w-4 mr-2" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                <span>Start Session</span>
              </>
            )}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="max-w-7xl mx-auto mt-2 flex items-center">
        <div 
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            sessionActive ? 'bg-green-500/20 text-green-100' : 'bg-amber-500/20 text-amber-100'
          }`}
        >
          <span className={`mr-1 flex h-2 w-2 relative`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sessionActive ? 'bg-green-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${sessionActive ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          </span>
          <span>
            {sessionActive ? 'Session Active' : 'Session Paused'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
