import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Ellipse, Rect, Text, Group } from 'react-konva';

/**
 * Component for purely visual design of poker table based on reference image
 * Based on provided image showing an oval-shaped green table with black border
 */
const PokerTableDesign: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Function to handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let width = Math.min(containerWidth, 800);
        let height = width * 0.5; // Maintain 2:1 aspect ratio for oval table
        
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Table dimensions
  const tableWidth = dimensions.width;
  const tableHeight = dimensions.height;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  
  // Border & felt colors from reference
  const borderColor = "#1a1a1a"; // Black border
  const feltColor = "#0F6B3B";   // Green felt
  const feltLineColor = "#0A5A30"; // Darker green for lines
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 relative" ref={containerRef}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Realistic Poker Table Design
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Based on provided reference image
        </p>
      </div>
      
      <Stage width={tableWidth} height={tableHeight}>
        <Layer>
          {/* Outer border (black) - exact match from reference */}
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={tableWidth * 0.48}
            radiusY={tableHeight * 0.9}
            fill={borderColor}
            shadowBlur={15}
            shadowColor="rgba(0,0,0,0.5)"
            shadowOffset={{ x: 0, y: 5 }}
            shadowOpacity={0.6}
          />
          
          {/* Main table (green felt) - exact match from reference */}
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={tableWidth * 0.44}
            radiusY={tableHeight * 0.75}
            fill={feltColor}
          />
          
          {/* Inner outline - subtle line seen in the reference image */}
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={tableWidth * 0.4}
            radiusY={tableHeight * 0.6}
            stroke={feltLineColor}
            strokeWidth={1}
            fill="transparent"
          />
          
          {/* Card area - center of the table as in reference */}
          <Rect
            x={centerX - (tableWidth * 0.16)}
            y={centerY - (tableHeight * 0.15)}
            width={tableWidth * 0.32}
            height={tableHeight * 0.3}
            fill={feltLineColor}
            opacity={0.3}
            cornerRadius={5}
          />
          
          {/* Card spots - exactly as shown in reference image (5 cards) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Rect
              key={`card-${i}`}
              x={centerX - (tableWidth * 0.14) + (i * tableWidth * 0.07)}
              y={centerY - (tableHeight * 0.1)}
              width={tableWidth * 0.05}
              height={tableHeight * 0.2}
              stroke={feltLineColor}
              strokeWidth={1}
              cornerRadius={3}
              fill="transparent"
            />
          ))}
        </Layer>
      </Stage>
      
      {/* Seat positions - visual placeholders, no functionality */}
      <div className="relative w-full h-0" style={{ paddingBottom: '50%' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((position) => {
          // Calculate positions around the table
          const angle = ((position - 1) / 8) * Math.PI * 2 - Math.PI / 2;
          const radius = 45; // Percent of container
          const left = 50 + radius * Math.cos(angle);
          const top = 50 + radius * Math.sin(angle);
          
          return (
            <div 
              key={position}
              className="absolute w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium
                       transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-300"
              style={{ 
                left: `${left}%`, 
                top: `${top}%`,
              }}
            >
              {position}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center max-w-md">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This is a purely visual representation matching the reference image of an oval poker table with green felt and black border.
          The design focuses on accurately reproducing the table without any functionality.
        </p>
      </div>
    </div>
  );
};

export default PokerTableDesign;