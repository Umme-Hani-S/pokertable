import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Circle, Text, Group } from 'react-konva';
import { usePokerTable } from '@/context/PokerTableContext';
import { formatTime } from '@/lib/timeUtils';
import { User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define seat positions around the table (angle in radians)
const getPositionFromAngle = (angle: number, radius: number, centerX: number, centerY: number) => {
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  };
};

// Define poker table colors
const tableColors = {
  felt: '#1f7a4d', // Green felt
  border: '#8B4513', // Brown wood border
  padding: '#0f5d3a', // Darker green inner padding
  dealer: '#333333', // Dealer button
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
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // Function to handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const size = Math.min(containerWidth, containerHeight, 700) - 40;
        setDimensions({ width: size, height: size });
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

  // Calculate table dimensions
  const tableWidth = dimensions.width;
  const tableHeight = dimensions.height;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const tableRadius = Math.min(centerX, centerY) * 0.9;
  const innerRadius = tableRadius * 0.85;
  const seatRadius = tableRadius * 0.15;
  const seatOuterRadius = seatRadius * 1.2;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto relative" ref={containerRef}>
      <div className="mb-4 flex justify-center w-full">
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
          {/* Table border - wooden edge */}
          <Circle
            x={centerX}
            y={centerY}
            radius={tableRadius}
            fill={tableColors.border}
            shadowBlur={15}
            shadowColor="rgba(0,0,0,0.3)"
            shadowOffset={{ x: 0, y: 5 }}
            shadowOpacity={0.5}
          />
          
          {/* Table felt */}
          <Circle
            x={centerX}
            y={centerY}
            radius={innerRadius}
            fill={tableColors.felt}
            shadowBlur={10}
            shadowColor="rgba(0,0,0,0.2)"
            shadowOffset={{ x: 0, y: 2 }}
            shadowOpacity={0.3}
          />
          
          {/* Table inner padding */}
          <Circle
            x={centerX}
            y={centerY}
            radius={innerRadius * 0.8}
            fill={tableColors.padding}
          />
          
          {/* Table center label */}
          <Group>
            <Circle
              x={centerX}
              y={centerY}
              radius={tableRadius * 0.2}
              fill="rgba(0,0,0,0.2)"
            />
            <Text
              x={centerX - tableRadius * 0.18}
              y={centerY - 10}
              text="MAIN TABLE"
              fontSize={tableRadius * 0.06}
              fontFamily="'Montserrat', sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
            <Text
              x={centerX - tableRadius * 0.1}
              y={centerY + 5}
              text={formatTime(sessionTime)}
              fontSize={tableRadius * 0.05}
              fontFamily="monospace"
              fill="#ffffff"
            />
          </Group>
          
          {/* Seats */}
          {!isLoadingSeats && seats.map((seat, index) => {
            const angle = (index * Math.PI * 2) / 8 - Math.PI / 2; // Start from top, go clockwise
            const position = getPositionFromAngle(angle, tableRadius * 0.75, centerX, centerY);
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
                <Circle
                  radius={seatOuterRadius}
                  fill="#333333"
                  shadowBlur={10}
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowOffset={{ x: 0, y: 3 }}
                  shadowOpacity={0.5}
                />
                
                {/* Seat background */}
                <Circle
                  radius={seatRadius}
                  fill={fillColor}
                  opacity={0.9}
                />
                
                {/* Seat number */}
                <Text
                  x={-seatRadius * 0.2}
                  y={-seatRadius * 0.6}
                  text={seat.position.toString()}
                  fontSize={seatRadius * 0.5}
                  fontFamily="sans-serif"
                  fontStyle="bold"
                  fill="#ffffff"
                />
                
                {/* Player name or empty icon */}
                {player ? (
                  <>
                    <Text
                      x={-seatRadius * 0.8}
                      y={-seatRadius * 0.1}
                      text={player.name.length > 10 ? player.name.substring(0, 8) + '...' : player.name}
                      fontSize={seatRadius * 0.4}
                      fontFamily="sans-serif"
                      width={seatRadius * 1.6}
                      align="center"
                      fill="#ffffff"
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
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill="#ffffff"
                  />
                )}
              </Group>
            );
          })}
          
          {/* Dealer button */}
          <Circle
            x={centerX + innerRadius * 0.5}
            y={centerY - innerRadius * 0.1}
            radius={tableRadius * 0.05}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1}
          />
          <Text
            x={centerX + innerRadius * 0.5 - tableRadius * 0.03}
            y={centerY - innerRadius * 0.1 - tableRadius * 0.03}
            text="D"
            fontSize={tableRadius * 0.05}
            fontFamily="sans-serif"
            fontStyle="bold"
            fill="#000000"
          />
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
