import React, { useState } from 'react';
import pokerTableImg from '../assets/poker-table.jpg';

const TableDesign: React.FC = () => {
  const [showSeats, setShowSeats] = useState(true);
  
  // Dealer position - bottom middle
  const dealerPosition = {
    left: 50, // center horizontally
    top: 93, // very bottom of the table
  };
  
  // Custom seat positions with specific requirements:
  // 1. Seat 1 right next to dealer
  // 2. No seat overlapping dealer
  // 3. Seat 5 directly opposite dealer
  const seatPositions = [
    // Seat 1 - right next to dealer (bottom right)
    { position: 1, left: 62, top: 87 },
    
    // Seat 2 - right side of table
    { position: 2, left: 77, top: 70 },
    
    // Seat 3 - top right
    { position: 3, left: 77, top: 30 },
    
    // Seat 4 - top right center
    { position: 4, left: 65, top: 15 },
    
    // Seat 5 - directly opposite dealer (top middle)
    { position: 5, left: 50, top: 10 },
    
    // Seat 6 - top left center
    { position: 6, left: 35, top: 15 },
    
    // Seat 7 - top left
    { position: 7, left: 23, top: 30 },
    
    // Seat 8 - left side of table
    { position: 8, left: 23, top: 70 },
    
    // Seat 9 - left next to dealer (bottom left)
    { position: 9, left: 38, top: 87 },
  ];
  
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
              <h2 className="text-xl font-semibold">9-Seat Poker Table</h2>
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
              
              {/* Dealer position */}
              {showSeats && (
                <div 
                  className="absolute w-12 h-12 rounded-full bg-white bg-opacity-90 border-2 border-red-500 shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ 
                    left: `${dealerPosition.left}%`, 
                    top: `${dealerPosition.top}%`,
                  }}
                >
                  <span className="text-red-700 font-bold">D</span>
                </div>
              )}
              
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
                <h3 className="text-lg font-medium mb-2">Table Layout</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><span className="font-medium">Dealer Position:</span> Bottom middle (D)</li>
                  <li><span className="font-medium">Seat #1:</span> Starting to dealer's right</li>
                  <li><span className="font-medium">Seat Arrangement:</span> 9 seats positioned clockwise</li>
                  <li><span className="font-medium">Table Design:</span> Exact oval shape with green felt surface and black border</li>
                </ul>
              </div>
              
              <div className="text-center text-gray-500 text-sm">
                The design uses the reference image with 9 seats placed around the table.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableDesign;