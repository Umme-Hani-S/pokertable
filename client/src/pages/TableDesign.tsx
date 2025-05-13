import React, { useState } from 'react';
import pokerTableImg from '../assets/poker-table.jpg';

const TableDesign: React.FC = () => {
  const [showSeats, setShowSeats] = useState(true);
  
  // Calculate positions for seats around the table
  const seatPositions = Array(8).fill(0).map((_, i) => {
    const angle = ((i) / 8) * Math.PI * 2 - Math.PI / 2;
    const radius = 45; // % of container
    const left = 50 + radius * Math.cos(angle);
    const top = 50 + radius * Math.sin(angle);
    return { left, top, position: i + 1 };
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Poker Table Reference Image</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto flex flex-col space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Exact Reference Image</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show Seat Positions</span>
                <button 
                  onClick={() => setShowSeats(!showSeats)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${showSeats ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span
                    className={`${
                      showSeats ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>
            
            <div className="aspect-video relative">
              {/* Using the actual reference image */}
              <img 
                src={pokerTableImg} 
                alt="Poker Table Reference" 
                className="w-full h-auto rounded-lg shadow-md" 
              />
              
              {/* Seat positions */}
              {showSeats && (
                <div className="absolute inset-0">
                  {seatPositions.map((seat) => (
                    <div 
                      key={seat.position}
                      className="absolute w-10 h-10 rounded-full bg-white bg-opacity-90 border-2 border-indigo-500 shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ 
                        left: `${seat.left}%`, 
                        top: `${seat.top}%`,
                      }}
                    >
                      <span className="text-indigo-700 font-bold">{seat.position}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="text-lg font-medium mb-2">Design Notes</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Exact oval shape with clean black border</li>
                  <li>Green felt surface with subtle inner outline</li>
                  <li>5 card positions in the center</li>
                  <li>Toggle seat positions to see potential player spots</li>
                </ul>
              </div>
              
              <div className="text-center text-gray-500 text-sm">
                This design uses the reference image directly to ensure visual accuracy.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableDesign;