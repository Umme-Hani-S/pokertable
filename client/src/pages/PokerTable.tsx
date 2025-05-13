import React from 'react';
import Header from '@/components/Header';
import PokerTableVisualization from '@/components/PokerTableVisualization';
import PlayerManagementPanel from '@/components/PlayerManagementPanel';
import PlayerActionDialog from '@/components/PlayerActionDialog';
import { usePokerTable } from '@/context/PokerTableContext';
import { Helmet } from 'react-helmet';

const PokerTable: React.FC = () => {
  const { 
    showPlayerDialog,
    setShowPlayerDialog,
    selectedPlayer 
  } = usePokerTable();

  return (
    <>
      <Helmet>
        <title>Poker Table Timer - Dealer Interface</title>
        <meta name="description" content="A poker table management tool for tracking player time and seat assignments" />
      </Helmet>
      
      <div className="flex flex-col h-screen">
        <Header />
        
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <PokerTableVisualization />
          <PlayerManagementPanel />
        </div>
        
        {showPlayerDialog && selectedPlayer && (
          <PlayerActionDialog
            player={selectedPlayer}
            onClose={() => setShowPlayerDialog(false)}
          />
        )}
      </div>
    </>
  );
};

export default PokerTable;
