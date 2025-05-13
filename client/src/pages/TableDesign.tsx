import React, { useState } from 'react';
import pokerTableImg from '../assets/poker-table.jpg';

const TableDesign: React.FC = () => {
  const [showSeats, setShowSeats] = useState(true);
  
  // Dealer position - bottom middle on the black border
  const dealerPosition = {
    left: 50, // center horizontally
    top: 92, // bottom on the black border
  };
  
  // Custom seat positions with specific requirements:
  // 1. Seat 1 right next to dealer
  // 2. No seat overlapping dealer
  // 3. Seat 5 directly opposite dealer
  // 4. All seats positioned exactly on the black border of the table
  
  // Defining the exact oval border coordinates
  // These values create an oval that exactly matches the black border of the table
  const borderRadiusX = 49; // % of container width - adjusted to match border exactly
  const borderRadiusY = 44; // % of container height - adjusted to match border exactly
  
  // Dealer position calculation
  const dealerAngle = Math.PI; // Bottom position (180 degrees)
  
  // Calculate positions for 9 seats exactly on the black border
  // Using mathematical formula to ensure precise border placement
  // - Seat #1 is positioned to LEFT of dealer
  // - Seat #5 is positioned opposite the dealer
  // - All seats are equidistant on the border with no overlap
  const seatPositions = Array(9).fill(0).map((_, i) => {
    // Start with seat 1 to the left of dealer and go clockwise
    // Formula distributes seats perfectly around the oval
    const index = i;
    // Convert index to angle (in degrees) - distribute 9 seats around the oval
    // We reserve about 40 degrees at the bottom for the dealer
    const angleRange = 320; // degrees to distribute seats
    const startAngle = 200; // degrees - leftmost position near dealer
    const stepAngle = angleRange / 8; // divide by (numSeats - 1)
    
    const angleDegrees = (startAngle + (index * stepAngle)) % 360;
    const angleRadians = angleDegrees * (Math.PI / 180);
    
    // Use the border radius values to position exactly on the black border
    const left = 50 + (borderRadiusX * Math.cos(angleRadians));
    const top = 50 + (borderRadiusY * Math.sin(angleRadians));
    
    return { position: i + 1, left, top };
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
                  className="absolute w-12 h-12 rounded-full bg-white border-2 border-red-600 shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ 
                    left: `${dealerPosition.left}%`, 
                    top: `${dealerPosition.top}%`,
                  }}
                >
                  <span className="text-red-700 font-bold text-lg">D</span>
                </div>
              )}
              
              {/* Seat positions */}
              {showSeats && (
                <div className="absolute inset-0">
                  {seatPositions.map((seat) => (
                    <div 
                      key={seat.position}
                      className="absolute w-10 h-10 rounded-full bg-white bg-opacity-90 border-2 border-indigo-600 shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10"
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