import React from 'react';
import { useGame } from '@/context/GameContext';
import { TopBar } from '@/components/hud/TopBar';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { SnowOverlay } from '@/components/board/SnowOverlay';
import { ToastContainer } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

// Modals
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { TelegramLoginModal } from '@/components/modals/TelegramLoginModal';
import { LegalModal } from '@/components/modals/LegalModal';
import { TileDetailsModal } from '@/components/modals/TileDetailsModal';
import { PropertyManagerModal } from '@/components/modals/PropertyManagerModal';
import { TradeModal } from '@/components/modals/TradeModal';
import { AuctionModal } from '@/components/modals/AuctionModal';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { CharacterPickerModal } from '@/components/modals/CharacterPickerModal';
import { CardModal } from '@/components/modals/CardModal';
import { RulesModal } from '@/components/modals/RulesModal';
import { SurrenderModal } from '@/components/modals/SurrenderModal';

export const App: React.FC = () => {
  const { gameState, theme } = useGame();

  const renderActiveScreen = () => {
    if (!gameState) {
      return <WelcomeScreen />;
    }
    if (gameState.status === 'LOBBY') {
      return <LobbyScreen />;
    }
    return <GameScreen />;
  };

  const isPlayingGame = Boolean(gameState && gameState.status !== 'LOBBY');
  const appBgClass = theme === 'soviet' ? 'soviet-space-table' : theme === 'noir' ? 'noir-game-table' : 'classic-game-table';

  return (
    <div className={cn("flex flex-col h-screen max-h-screen w-screen max-w-screen text-foreground relative overflow-hidden select-none", appBgClass)}>
      {/* Top Header (Only shown on Welcome and Lobby screens) */}
      {!isPlayingGame && <TopBar />}

      {/* Main Screen Content (Scrollable in menus, fitted in-game) */}
      <main
        className={cn(
          "flex-1 min-h-0 w-full flex flex-col items-center relative z-10",
          isPlayingGame ? "justify-center overflow-hidden" : "overflow-y-auto justify-start"
        )}
      >
        {renderActiveScreen()}
      </main>

      {/* Global Canvas Effects & Overlays */}
      <SnowOverlay />
      <ToastContainer />

      {/* Modals Container */}
      <SettingsModal />
      <ProfileModal />
      <TelegramLoginModal />
      <CharacterPickerModal />
      <CardModal />
      <RulesModal />
      <SurrenderModal />
      <LegalModal />
      <TileDetailsModal />
      <PropertyManagerModal />
      <TradeModal />
      <AuctionModal />
      <GameOverModal />
    </div>
  );
};
