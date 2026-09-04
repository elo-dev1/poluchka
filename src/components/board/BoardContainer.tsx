import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { BoardTile } from './BoardTile';
import { BoardCenterDashboard } from './BoardCenterDashboard';
import { TileData } from '@/types/game';
import { soundEngine } from '@/lib/soundEngine';
import { cn } from '@/lib/utils';

interface BoardContainerProps {
  onTileClick: (tile: TileData) => void;
  selectedTile?: TileData | null;
  onCloseSelectedTile?: () => void;
}

export const BoardContainer: React.FC<BoardContainerProps> = ({ onTileClick, selectedTile }) => {
  const { gameState, animSpeed, setIsTokenMoving, theme } = useGame();

  const [animatedPositions, setAnimatedPositions] = useState<Record<string, number>>({});
  const [movingPlayers, setMovingPlayers] = useState<Record<string, boolean>>({});
  const activeIntervalsRef = useRef<Record<string, any>>({});
  const activeTimeoutsRef = useRef<Record<string, any>>({});
  const isMovingRef = useRef<boolean>(false);
  const animatingTargetRef = useRef<Record<string, number>>({});

  const speedToMsMap: Record<number, number> = {
    1: 340, 2: 250, 3: 170, 4: 110, 5: 65,
  };
  const hopDuration = animSpeed <= 5
    ? (speedToMsMap[animSpeed] || 170)
    : Math.max(65, Math.min(360, animSpeed));

  useEffect(() => {
    if (!gameState || !gameState.players) return;
    const totalTilesCount = gameState.board?.length || 24;
    const goToJailTile = gameState.board?.find((t) => t.type === 'go_to_jail');
    const jailTile = gameState.board?.find((t) => t.type === 'jail');
    const jailPos = jailTile ? jailTile.id : (totalTilesCount === 40 ? 10 : 6);

    gameState.players.forEach((player) => {
      const pId = player.id;
      const targetPos = player.position;
      const currentPos = animatedPositions[pId];

      if (currentPos === undefined) {
        setAnimatedPositions((prev) => ({ ...prev, [pId]: targetPos }));
        return;
      }

      if (currentPos === targetPos) {
        return;
      }

      // If animation to this target is already actively running, don't interrupt it
      if (animatingTargetRef.current[pId] === targetPos) {
        return;
      }

      // Clear any prior active intervals or timeouts for this player
      if (activeIntervalsRef.current[pId]) {
        clearInterval(activeIntervalsRef.current[pId]);
        delete activeIntervalsRef.current[pId];
      }
      if (activeTimeoutsRef.current[pId]) {
        clearTimeout(activeTimeoutsRef.current[pId]);
        delete activeTimeoutsRef.current[pId];
      }

      // Detect if player rolled and landed on "Go to jail" ("Отправляйтесь в тюрьму" / "Эвакуация")
      const isGoToJailRoll = Boolean(
        (gameState.lastRoll?.isGoToJail && gameState.lastRoll?.playerId === pId) ||
        (player.inJail && targetPos === jailPos && goToJailTile && (() => {
          const distToGoToJail = (goToJailTile.id - currentPos + totalTilesCount) % totalTilesCount;
          return distToGoToJail > 0 && distToGoToJail <= 12;
        })())
      );

      if (isGoToJailRoll && goToJailTile) {
        const intermediatePos = goToJailTile.id;
        const walkDistance = (intermediatePos - currentPos + totalTilesCount) % totalTilesCount;

        if (walkDistance > 0 && walkDistance <= 12) {
          animatingTargetRef.current[pId] = targetPos;
          if (!isMovingRef.current) {
            isMovingRef.current = true;
            setIsTokenMoving(true);
          }
          setMovingPlayers((prev) => ({ ...prev, [pId]: true }));

          let stepCount = 0;
          let stepPos = currentPos;
          const interval = setInterval(() => {
            stepCount++;
            stepPos = (stepPos + 1) % totalTilesCount;
            soundEngine.playStep();
            setAnimatedPositions((prev) => ({ ...prev, [pId]: stepPos }));

            if (stepCount >= walkDistance || stepPos === intermediatePos) {
              clearInterval(interval);
              delete activeIntervalsRef.current[pId];

              // Arrived physically on "Go to Jail" tile!
              setAnimatedPositions((prev) => ({ ...prev, [pId]: intermediatePos }));
              soundEngine.playJail();

              // Pause on the "Go to jail" field so players clearly see the landing
              const jailTimeout = setTimeout(() => {
                delete activeTimeoutsRef.current[pId];
                delete animatingTargetRef.current[pId];

                // Now transfer to the Jail cell
                setAnimatedPositions((prev) => ({ ...prev, [pId]: targetPos }));
                setMovingPlayers((prev) => ({ ...prev, [pId]: false }));

                if (
                  Object.keys(activeIntervalsRef.current).length === 0 &&
                  Object.keys(activeTimeoutsRef.current).length === 0
                ) {
                  isMovingRef.current = false;
                  setIsTokenMoving(false);
                }
              }, Math.max(750, hopDuration * 3));

              activeTimeoutsRef.current[pId] = jailTimeout;
            }
          }, hopDuration);

          activeIntervalsRef.current[pId] = interval;
          return;
        }
      }

      // Standard forward movement
      const forwardDistance = (targetPos - currentPos + totalTilesCount) % totalTilesCount;
      if (forwardDistance > 0 && forwardDistance <= 12 && !player.inJail) {
        animatingTargetRef.current[pId] = targetPos;
        if (!isMovingRef.current) {
          isMovingRef.current = true;
          setIsTokenMoving(true);
        }
        setMovingPlayers((prev) => ({ ...prev, [pId]: true }));

        let stepCount = 0;
        let stepPos = currentPos;
        const interval = setInterval(() => {
          stepCount++;
          stepPos = (stepPos + 1) % totalTilesCount;
          soundEngine.playStep();
          setAnimatedPositions((prev) => ({ ...prev, [pId]: stepPos }));

          if (stepCount >= forwardDistance || stepPos === targetPos) {
            clearInterval(interval);
            delete activeIntervalsRef.current[pId];
            delete animatingTargetRef.current[pId];
            setMovingPlayers((prev) => ({ ...prev, [pId]: false }));
            setAnimatedPositions((prev) => ({ ...prev, [pId]: targetPos }));

            if (
              Object.keys(activeIntervalsRef.current).length === 0 &&
              Object.keys(activeTimeoutsRef.current).length === 0
            ) {
              isMovingRef.current = false;
              setIsTokenMoving(false);
            }
          }
        }, hopDuration);

        activeIntervalsRef.current[pId] = interval;
      } else {
        delete animatingTargetRef.current[pId];
        setAnimatedPositions((prev) => ({ ...prev, [pId]: targetPos }));
      }
    });
  }, [gameState?.players, gameState?.board, gameState?.lastRoll, hopDuration, setIsTokenMoving]);

  useEffect(() => {
    return () => {
      Object.values(activeIntervalsRef.current).forEach((interval) => clearInterval(interval));
      Object.values(activeTimeoutsRef.current).forEach((timeout) => clearTimeout(timeout));
      isMovingRef.current = false;
      setIsTokenMoving(false);
    };
  }, [setIsTokenMoving]);

  if (!gameState) return null;

  const is40 = (gameState.board?.length || 24) === 40;
  const totalTiles = gameState.board?.length || 24;
  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 select-none overflow-hidden">
      <div
        className={cn(
          'transition-all duration-300 relative flex flex-col w-full h-full max-w-full max-h-full',
          isNoir ? 'noir-board-frame font-noir-body' : isSoviet ? 'soviet-board-frame font-soviet' : 'classic-board-frame font-sans'
        )}
      >
        {/* Corner accents */}
        {isNoir ? (
          ['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4 z-20 flex items-center justify-center pointer-events-none`}>
              <div className="w-3 h-3 rounded-full bg-[#d4a647] border border-[#1a1410] shadow-inner" />
            </div>
          ))
        ) : isSoviet ? (
          ['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4 z-20 flex items-center justify-center pointer-events-none`}>
              <div className="w-3 h-3 rounded-full bg-[#9B8B6B] border border-[#C4A96B] shadow-inner" />
            </div>
          ))
        ) : (
          ['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-3 h-3 z-20 flex items-center justify-center pointer-events-none`}>
              <div className="w-2 h-2 rounded-full bg-[#d4af37] border border-[#b8860b] shadow-sm" />
            </div>
          ))
        )}

        {/* Board grid */}
        <div
          className={
            is40
              ? 'grid grid-cols-[1.5fr_repeat(9,1fr)_1.5fr] grid-rows-[1.5fr_repeat(9,1fr)_1.5fr] gap-px w-full h-full'
              : 'grid grid-cols-[1.35fr_repeat(5,1fr)_1.35fr] grid-rows-[1.35fr_repeat(5,1fr)_1.35fr] gap-px w-full h-full'
          }
          style={{ backgroundColor: isNoir ? '#1a1410' : isSoviet ? '#B8A88A' : '#CBD5E1' }}
        >
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
              isSelected={selectedTile?.id === tile.id}
            />
          ))}
          {/* Center dashboard spans the inner grid */}
          <BoardCenterDashboard />
        </div>
      </div>
    </div>
  );
};
