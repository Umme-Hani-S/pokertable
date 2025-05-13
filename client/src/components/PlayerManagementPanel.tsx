import React, { useState } from 'react';
import { usePokerTable } from '@/context/PokerTableContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatTime, formatTimeOfDay } from '@/lib/timeUtils';
import { 
  XIcon, 
  RefreshCcw, 
  Users, 
  Clock, 
  Download, 
  UserPlus, 
  ClipboardList,
  BarChart3
} from 'lucide-react';
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
      className={`w-full lg:w-96 bg-white dark:bg-gray-900 border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        showPanel ? 'h-[50vh] lg:h-auto' : 'h-12'
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-between">
        <h2 className="font-bold text-white flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Player Management
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="lg:hidden text-white hover:bg-indigo-600" 
          onClick={() => setShowPanel(!showPanel)}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {showPanel && (
        <Tabs defaultValue="active" className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400">
              <Users className="h-4 w-4 mr-1" />
              <span>Active</span>
            </TabsTrigger>
            <TabsTrigger value="waiting" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400">
              <ClipboardList className="h-4 w-4 mr-1" />
              <span>Waiting</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="flex-1 overflow-auto p-0">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-indigo-500" />
                    Active Players ({activePlayers.length})
                  </h3>
                  <Button variant="outline" size="sm" className="h-7 text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800">
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
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
                      <div className="h-5 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  )}
                  
                  {!isLoadingPlayers && activePlayers.length === 0 && (
                    <div className="text-center py-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
                      <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No active players</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add a player using the form below</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add New Player Form */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-3">
                  <UserPlus className="h-4 w-4 mr-2 text-indigo-500" />
                  Add New Player
                </h3>
                <AddPlayerForm />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="waiting" className="flex-1 overflow-auto p-0">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2 text-amber-500" />
                    Waiting List ({waitingPlayers.length})
                  </h3>
                  <Button variant="outline" size="sm" className="h-7 text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800">
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                {/* Waiting Player List */}
                <div className="space-y-3">
                  {!isLoadingPlayers ? (
                    waitingPlayers.map(player => (
                      <div key={player.id} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300 flex items-center justify-center font-medium text-lg mr-3 shadow-sm">
                            {player.id}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">{player.name}</h4>
                            <span className="text-xs flex items-center text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3 mr-1" />
                              Waiting since {formatTimeOfDay(player.timeJoined)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-800">
                            <XIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
                      <div className="h-5 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  )}
                  
                  {!isLoadingPlayers && waitingPlayers.length === 0 && (
                    <div className="text-center py-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
                      <ClipboardList className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No players waiting</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add players to the waiting list below</p>
                    </div>
                  )}
                </div>
                
                {/* Add to Waiting List Form */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-3">
                    <UserPlus className="h-4 w-4 mr-2 text-amber-500" />
                    Add to Waiting List
                  </h3>
                  <AddPlayerForm initialStatus="waiting" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 overflow-auto p-0">
            <div className="p-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-3">
                <BarChart3 className="h-4 w-4 mr-2 text-indigo-500" />
                Session Statistics
              </h3>
              
              {/* Session Stats Overview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1 flex items-center justify-center">
                    <Users className="h-3 w-3 mr-1" />
                    Total Players
                  </p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{activePlayers.length + waitingPlayers.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1 flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Avg. Time
                  </p>
                  <p className="text-2xl font-bold font-mono text-green-700 dark:text-green-300">{formatTime(averageTime)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center justify-center">
                    <Users className="h-3 w-3 mr-1" />
                    Active Players
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activePlayers.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1 flex items-center justify-center">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    Waiting List
                  </p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{waitingPlayers.length}</p>
                </div>
              </div>
              
              {/* Player Time Chart */}
              {activePlayers.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <BarChart3 className="h-3 w-3 mr-1 text-indigo-500" />
                    Player Time Distribution
                  </h4>
                  <div className="h-40 flex items-end justify-around gap-2 pt-6 border-b border-l border-gray-300 dark:border-gray-700 relative">
                    {activePlayers.map((player) => {
                      const maxTime = Math.max(...activePlayers.map(p => p.timeElapsed), 1);
                      const height = `${Math.max((player.timeElapsed / maxTime) * 100, 5)}%`;
                      const bgColor = player.status === 'active' 
                        ? 'bg-gradient-to-t from-green-500 to-green-400' 
                        : player.status === 'inactive' 
                          ? 'bg-gradient-to-t from-red-500 to-red-400' 
                          : 'bg-gradient-to-t from-amber-500 to-amber-400';
                      
                      return (
                        <div 
                          key={player.id} 
                          className={`w-12 ${bgColor} rounded-t-md shadow-sm`} 
                          style={{ height }}
                        >
                          <div className="text-xs text-center -mt-5 truncate max-w-full px-1 text-gray-700 dark:text-gray-300 font-medium">
                            {player.name.length > 8 ? player.name.substring(0, 6) + '..' : player.name}
                          </div>
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
                  variant="default" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md disabled:opacity-50 disabled:pointer-events-none"
                  disabled={!sessionActive}
                >
                  <Download className="h-4 w-4 mr-2" />
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
