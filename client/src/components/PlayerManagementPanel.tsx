import React, { useState } from 'react';
import { usePokerTable } from '@/context/PokerTableContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatTime, formatTimeOfDay } from '@/lib/timeUtils';
import { XIcon, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddPlayerForm from './AddPlayerForm';
import PlayerCard from './PlayerCard';

const PlayerManagementPanel: React.FC = () => {
  const { 
    activePlayers, 
    waitingPlayers,
    sessionTime,
    sessionActive,
    isLoadingPlayers
  } = usePokerTable();
  
  const [showPanel, setShowPanel] = useState(true);

  // Calculate average time
  const averageTime = activePlayers.length 
    ? Math.floor(activePlayers.reduce((sum, p) => sum + p.timeElapsed, 0) / activePlayers.length) 
    : 0;

  return (
    <div 
      className={`w-full lg:w-80 bg-surface dark:bg-gray-800 border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        showPanel ? 'h-[50vh] lg:h-auto' : 'h-12'
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold">Player Management</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="lg:hidden" 
          onClick={() => setShowPanel(!showPanel)}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {showPanel && (
        <Tabs defaultValue="active" className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <TabsTrigger value="active" className="flex-1">Active Players</TabsTrigger>
            <TabsTrigger value="waiting" className="flex-1">Waiting List</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="flex-1 overflow-auto p-0">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Players ({activePlayers.length})
                  </h3>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-500 hover:text-indigo-600">
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                {/* Active Player List */}
                <div className="space-y-3">
                  {!isLoadingPlayers ? (
                    activePlayers.map(player => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        seat={player.seatId || undefined}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      Loading players...
                    </div>
                  )}
                  
                  {!isLoadingPlayers && activePlayers.length === 0 && (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      No active players
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add New Player Form */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Player</h3>
                <AddPlayerForm />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="waiting" className="flex-1 overflow-auto p-0">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Waiting List ({waitingPlayers.length})
                  </h3>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-500 hover:text-indigo-600">
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                {/* Waiting Player List */}
                <div className="space-y-3">
                  {!isLoadingPlayers ? (
                    waitingPlayers.map(player => (
                      <div key={player.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-500 flex items-center justify-center font-medium mr-3">
                            W{player.id}
                          </div>
                          <div>
                            <h4 className="font-medium">{player.name}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Waiting since {formatTimeOfDay(player.timeJoined)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md text-gray-500 hover:text-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md text-gray-500 hover:text-red-500">
                            <XIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      Loading waiting list...
                    </div>
                  )}
                  
                  {!isLoadingPlayers && waitingPlayers.length === 0 && (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      No players waiting
                    </div>
                  )}
                </div>
                
                {/* Add to Waiting List Form */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add to Waiting List</h3>
                  <AddPlayerForm initialStatus="waiting" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 overflow-auto p-0">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Session Statistics</h3>
              
              {/* Session Stats Overview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Players</p>
                  <p className="text-xl font-semibold">{activePlayers.length + waitingPlayers.length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. Time</p>
                  <p className="text-xl font-semibold font-mono">{formatTime(averageTime)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Players</p>
                  <p className="text-xl font-semibold">{activePlayers.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Waiting List</p>
                  <p className="text-xl font-semibold">{waitingPlayers.length}</p>
                </div>
              </div>
              
              {/* Player Time Chart */}
              {activePlayers.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Player Time Distribution</h4>
                  <div className="h-40 flex items-end justify-around gap-2 pt-6 border-b border-l border-gray-300 dark:border-gray-700 relative">
                    {activePlayers.map((player) => {
                      const maxTime = Math.max(...activePlayers.map(p => p.timeElapsed), 1);
                      const height = `${Math.max((player.timeElapsed / maxTime) * 100, 5)}%`;
                      const bgColor = player.status === 'active' ? 'bg-green-500' : player.status === 'inactive' ? 'bg-red-500' : 'bg-amber-500';
                      
                      return (
                        <div 
                          key={player.id} 
                          className={`w-10 ${bgColor} rounded-t-md`} 
                          style={{ height }}
                        >
                          <div className="text-xs text-center mt-2 truncate max-w-full px-1">{player.name}</div>
                        </div>
                      );
                    })}
                    
                    {/* Y-axis labels */}
                    <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>2h</span>
                      <span>1h</span>
                      <span>0h</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Download Report */}
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full border border-gray-300 dark:border-gray-700"
                  disabled={!sessionActive}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Session Report
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PlayerManagementPanel;
