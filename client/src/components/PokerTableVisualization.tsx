import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Ellipse, Rect, Text, Group } from 'react-konva';
import { usePokerTable } from '@/context/PokerTableContext';
import { formatTime } from '@/lib/timeUtils';
import { User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define seat positions for oval table
const calculateSeatPositions = (
  numSeats: number, 
  tableWidth: number, 
  tableHeight: number, 
  xOffset: number = 0, 
  yOffset: number = 0
) => {
  const positions = [];
  const centerX = tableWidth / 2 + xOffset;
  const centerY = tableHeight / 2 + yOffset;
  const radiusX = tableWidth * 0.43; // Horizontal radius
  const radiusY = tableHeight * 0.68; // Vertical radius

  for (let i = 0; i < numSeats; i++) {
    // Start from top and go clockwise
    const angle = (i * 2 * Math.PI / numSeats) - Math.PI / 2;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    positions.push({ x, y });
  }

  return positions;
};

// Define poker table colors
const tableColors = {
  felt: '#0F6B3B', // Green felt
  border: '#1a1a1a', // Black border
  padding: '#0A5A30', // Darker green inner padding
  dealer: '#ffffff', // Dealer button
  active: '#4ade80', // Active player
  inactive: '#f87171', // Inactive player
  waiting: '#fbbf24', // Waiting player
  empty: '#9ca3af', // Empty seat
};

const PokerTableVisualization: React.FC = () => {
  const { 
    sessionActive, 
    sessionTime, 
    seats, 
    isLoadingSeats, 
    getPlayerBySeatId,
    setSelectedSeat,
    setSelectedPlayer,
    setShowPlayerDialog
  } = usePokerTable();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 440 });

  // Function to handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let width = Math.min(containerWidth, 900);
        let height = width * 0.55; // Maintain aspect ratio for oval table
        
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleSeatClick = (seatId: number) => {
    setSelectedSeat(seatId);
    const player = getPlayerBySeatId(seatId);
    
    if (player) {
      setSelectedPlayer(player);
      setShowPlayerDialog(true);
    }
  };

  // Generate seat positions
  const seatPositions = calculateSeatPositions(8, dimensions.width, dimensions.height);

  // Calculate table dimensions
  const tableWidth = dimensions.width;
  const tableHeight = dimensions.height;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  
  // Seat sizing
  const seatRadius = Math.min(tableWidth, tableHeight) * 0.06;
  const seatOuterRadius = seatRadius * 1.15;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto relative" ref={containerRef}>
      <div className="mb-6 flex justify-center w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-2 flex items-center">
          <span className="mr-2 font-medium">Table Status:</span>
          <span 
            className={`font-semibold flex items-center ${
              sessionActive ? 'text-green-500' : 'text-amber-500'
            }`}
          >
            <span className="mr-1 flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sessionActive ? 'bg-green-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${sessionActive ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            </span>
            {sessionActive ? 'Active' : 'Paused'}
          </span>
          
          <span className="mx-3 text-gray-300">|</span>
          <span className="mr-2 font-medium">Session Time:</span>
          <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">
            {formatTime(sessionTime)}
          </span>
        </div>
      </div>
      
      <Stage width={tableWidth} height={tableHeight} ref={stageRef}>
        <Layer>
          {/* Table - Using oval shape */}
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={tableWidth * 0.48}
            radiusY={tableHeight * 0.75}
            fill={tableColors.border}
            shadowBlur={20}
            shadowColor="rgba(0,0,0,0.4)"
            shadowOffset={{ x: 0, y: 8 }}
            shadowOpacity={0.6}
          />
          
          {/* Table felt */}
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={tableWidth * 0.44}
            radiusY={tableHeight * 0.65}
            fill={tableColors.felt}
          />
          
          {/* Inner border/outline */}
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={tableWidth * 0.40}
            radiusY={tableHeight * 0.58}
            stroke={tableColors.padding}
            strokeWidth={1.5}
            fill="transparent"
          />
          
          {/* Card area */}
          <Rect
            x={centerX - 100}
            y={centerY - 30}
            width={200}
            height={60}
            fill={tableColors.padding}
            opacity={0.3}
            cornerRadius={5}
          />
          
          {/* Card spots */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Rect
              key={`card-${i}`}
              x={centerX - 85 + (i * 40)}
              y={centerY - 20}
              width={30}
              height={40}
              stroke={tableColors.padding}
              strokeWidth={1}
              cornerRadius={3}
              fill="transparent"
            />
          ))}
          
          {/* Seats */}
          {!isLoadingSeats && seats.map((seat, index) => {
            const position = seatPositions[index]; // Get pre-calculated positions for oval table
            const player = getPlayerBySeatId(seat.id);
            
            // Status colors
            let fillColor = tableColors.empty;
            if (player) {
              fillColor = player.status === 'active' 
                ? tableColors.active 
                : player.status === 'inactive' 
                  ? tableColors.inactive 
                  : tableColors.waiting;
            }
            
            return (
              <Group 
                key={seat.id} 
                x={position.x} 
                y={position.y}
                onClick={() => handleSeatClick(seat.id)}
                onTap={() => handleSeatClick(seat.id)}
                draggable={false}
              >
                {/* Seat border */}
                <Ellipse
                  radiusX={seatOuterRadius}
                  radiusY={seatOuterRadius}
                  fill="#333333"
                  shadowBlur={10}
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowOffset={{ x: 0, y: 3 }}
                  shadowOpacity={0.5}
                />
                
                {/* Seat background */}
                <Ellipse
                  radiusX={seatRadius}
                  radiusY={seatRadius}
                  fill={fillColor}
                  opacity={0.95}
                />
                
                {/* Seat number */}
                <Text
                  x={-seatRadius * 0.2}
                  y={-seatRadius * 0.6}
                  text={seat.position.toString()}
                  fontSize={seatRadius * 0.5}
                  fontFamily="'Montserrat', sans-serif"
                  fontStyle="bold"
                  fill="#ffffff"
                />
                
                {/* Player name or empty icon */}
                {player ? (
                  <>
                    <Text
                      x={-seatRadius * 0.8}
                      y={-seatRadius * 0.1}
                      text={player.name.length > 8 ? player.name.substring(0, 6) + '...' : player.name}
                      fontSize={seatRadius * 0.4}
                      fontFamily="'Inter', sans-serif"
                      width={seatRadius * 1.6}
                      align="center"
                      fill="#ffffff"
                      fontStyle="bold"
                    />
                    <Text
                      x={-seatRadius * 0.8}
                      y={seatRadius * 0.3}
                      text={player.status === 'waiting' ? 'Waiting' : formatTime(player.timeElapsed)}
                      fontSize={seatRadius * 0.35}
                      fontFamily="monospace"
                      width={seatRadius * 1.6}
                      align="center"
                      fill="#ffffff"
                    />
                  </>
                ) : (
                  <Text
                    x={-seatRadius * 0.3}
                    y={-seatRadius * 0.3}
                    text="+"
                    fontSize={seatRadius * 0.9}
                    fontFamily="'Inter', sans-serif"
                    fontStyle="bold"
                    fill="#ffffff"
                  />
                )}
              </Group>
            );
          })}
          
          {/* Dealer button */}
          <Group x={centerX + tableWidth * 0.23} y={centerY - tableHeight * 0.05}>
            <Ellipse
              radiusX={seatRadius * 0.4}
              radiusY={seatRadius * 0.4}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={1}
              shadowBlur={3}
              shadowColor="rgba(0,0,0,0.3)"
              shadowOffset={{ x: 0, y: 1 }}
            />
            <Text
              x={-seatRadius * 0.15}
              y={-seatRadius * 0.25}
              text="D"
              fontSize={seatRadius * 0.45}
              fontFamily="'Montserrat', sans-serif"
              fontStyle="bold"
              fill="#000000"
            />
          </Group>
          
          {/* Table name overlay */}
          <Group x={centerX} y={centerY - tableHeight * 0.35}>
            <Rect
              x={-tableWidth * 0.15}
              y={-tableHeight * 0.03}
              width={tableWidth * 0.30}
              height={tableHeight * 0.06}
              fill="rgba(0,0,0,0.7)"
              cornerRadius={5}
            />
            <Text
              x={-tableWidth * 0.13}
              y={-tableHeight * 0.015}
              text="MAIN TABLE"
              fontSize={tableHeight * 0.03}
              fontFamily="'Montserrat', sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
          </Group>
          
          {/* Session timer overlay */}
          <Group x={centerX} y={centerY + tableHeight * 0.35}>
            <Rect
              x={-tableWidth * 0.1}
              y={-tableHeight * 0.025}
              width={tableWidth * 0.2}
              height={tableHeight * 0.05}
              fill={sessionActive ? "rgba(22, 163, 74, 0.8)" : "rgba(245, 158, 11, 0.8)"}
              cornerRadius={5}
            />
            <Text
              x={-tableWidth * 0.08}
              y={-tableHeight * 0.015}
              text={formatTime(sessionTime)}
              fontSize={tableHeight * 0.025}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#ffffff"
            />
          </Group>
        </Layer>
      </Stage>

      {/* Dealer Action Button */}
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
        <Button 
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center p-0"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default PokerTableVisualization;
