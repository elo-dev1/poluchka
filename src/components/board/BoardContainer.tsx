import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { BoardTile } from './BoardTile';
import { BoardCenterDashboard } from './BoardCenterDashboard';
import { TileData } from '@/types/game';
import { soundEngine } from '@/lib/soundEngine';
import { cn } from '@/lib/utils';

interface BoardContainerProps {
  onTileClick: (tile: TileData) => void;
}

export const BoardContainer: React.FC<BoardContainerProps> = ({ onTileClick }) => {
  const { gameState, is3D, tiltX, rotZ, animSpeed, setIsTokenMoving } = useGame();

  const [animatedPositions, setAnimatedPositions] = useState<Record<string, number>>({});
  const [movingPlayers, setMovingPlayers] = useState<Record<string, boolean>>({});
  const activeIntervalsRef = useRef<Record<string, any>>({});
  const isMovingRef = useRef<boolean>(false);

  const hopDuration = Math.max(80, Math.min(400, animSpeed || 170));

  useEffect(() => {
    if (!gameState || !gameState.players) return;

    gameState.players.forEach((player) => {
      const pId = player.id;
      const targetPos = player.position;
      const currentPos = animatedPositions[pId];

      if (currentPos === undefined) {
        setAnimatedPositions((prev) => ({ ...prev, [pId]: targetPos }));
        return;
      }

      if (currentPos === targetPos) return;

      // Clear any running interval for this player
      if (activeIntervalsRef.current[pId]) {
        clearInterval(activeIntervalsRef.current[pId]);
        delete activeIntervalsRef.current[pId];
      }

      const totalTiles = gameState.board?.length || 24;
      const forwardDistance = (targetPos - currentPos + totalTiles) % totalTiles;

      // Smooth step-by-step movement if regular dice walk (1 to 12 steps)
      if (forwardDistance > 0 && forwardDistance <= 12 && !player.inJail) {
        if (!isMovingRef.current) {
          isMovingRef.current = true;
          setIsTokenMoving(true);
        }
        setMovingPlayers((prev) => ({ ...prev, [pId]: true }));
        let stepCount = 0;
        let stepPos = currentPos;

        const interval = setInterval(() => {
          stepCount++;
          stepPos = (stepPos + 1) % totalTiles;
          soundEngine.playStep();

          setAnimatedPositions((prev) => ({ ...prev, [pId]: stepPos }));

          if (stepCount >= forwardDistance || stepPos === targetPos) {
            clearInterval(interval);
            delete activeIntervalsRef.current[pId];
            setMovingPlayers((prev) => ({ ...prev, [pId]: false }));
            setAnimatedPositions((prev) => ({ ...prev, [pId]: targetPos }));

            // Check if all player movements completed
            if (Object.keys(activeIntervalsRef.current).length === 0) {
              isMovingRef.current = false;
              setIsTokenMoving(false);
            }
          }
        }, hopDuration);

        activeIntervalsRef.current[pId] = interval;
      } else {
        // Direct teleport (e.g. Go to Jail or reset)
        setAnimatedPositions((prev) => ({ ...prev, [pId]: targetPos }));
      }
    });
  }, [gameState?.players, gameState?.board?.length, hopDuration, setIsTokenMoving]);

  // Clean up all intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(activeIntervalsRef.current).forEach((interval) => clearInterval(interval));
      isMovingRef.current = false;
      setIsTokenMoving(false);
    };
  }, [setIsTokenMoving]);

  if (!gameState) return null;

  const is40 = (gameState.board?.length || 24) === 40;
  const totalTiles = gameState.board?.length || 24;

  const transformStyle = is3D
    ? {
        transform: `rotateX(${tiltX}deg) rotateZ(${rotZ}deg)`,
      }
    : undefined;

  return (
    <div className="perspective-board w-full h-full flex items-center justify-center p-1 sm:p-2 select-none overflow-hidden">
      <div
        className={cn(
          'board-3d-wrapper aspect-square border border-indigo-500/25 shadow-2xl transition-transform duration-500 relative rounded-2xl sm:rounded-3xl flex flex-col my-auto mx-auto',
          is40
            ? 'w-full h-full max-w-[min(100vw-1rem,100vh-4.5rem)] lg:max-w-[min(100vw-1rem,100vh-1rem)] max-h-[min(100vw-1rem,100vh-4.5rem)] lg:max-h-[min(100vw-1rem,100vh-1rem)] p-1 sm:p-1.5'
            : 'w-full h-full max-w-[min(100vw-1.5rem,100vh-5rem,540px)] max-h-[min(100vw-1.5rem,100vh-5rem,540px)] p-1.5 sm:p-2'
        )}
        style={{
          ...transformStyle,
          backgroundColor: '#0a0d1d',
          boxShadow: is3D
            ? '0 35px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.2)'
            : '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.12)',
        }}
      >
        {/* Dynamic Perimeter Grid filling 100% width and 100% height */}
        <div
          className={
            is40
              ? 'grid grid-cols-[1.5fr_repeat(9,1fr)_1.5fr] grid-rows-[1.5fr_repeat(9,1fr)_1.5fr] gap-0.5 sm:gap-1 w-full h-full flex-1'
              : 'grid grid-cols-[1.3fr_repeat(5,1fr)_1.3fr] grid-rows-[1.3fr_repeat(5,1fr)_1.3fr] gap-1 md:gap-1.5 w-full h-full flex-1'
          }
        >
          {/* Tiles */}
          {gameState.board.map((tile) => (
            <BoardTile
              key={tile.id}
              tile={tile}
              players={gameState.players}
              currentPlayerId={gameState.players[gameState.currentTurnIndex]?.id || null}
              totalTiles={totalTiles}
              animatedPositions={animatedPositions}
              movingPlayers={movingPlayers}
              onClick={onTileClick}
            />
          ))}

          {/* Center Dashboard */}
          <BoardCenterDashboard />
        </div>
      </div>
    </div>
  );
};
