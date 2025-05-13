import React from 'react';
import PokerTableDesign from '@/components/PokerTableDesign';

const TableDesign: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Poker Table Design</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto flex flex-col space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Realistic Poker Table</h2>
            <div className="h-[500px] w-full border border-gray-200 dark:border-gray-700 rounded-lg">
              <PokerTableDesign />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableDesign;