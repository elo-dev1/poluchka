import React from 'react';
import { useGame } from '@/context/GameContext';
import { TopBar } from '@/components/hud/TopBar';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { SnowOverlay } from '@/components/board/SnowOverlay';
import { ToastContainer } from '@/components/ui/toast';

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
  const { gameState } = useGame();

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

  return (
    <div className="flex flex-col h-screen max-h-screen w-screen max-w-screen bg-[#090c1a] text-foreground relative overflow-hidden select-none">
      {/* Top Header (Only shown on Welcome and Lobby screens) */}
      {!isPlayingGame && <TopBar />}

      {/* Main Screen Content (Strictly fitted to viewport) */}
      <main className="flex-1 min-h-0 w-full flex flex-col items-center justify-center relative z-10 overflow-hidden">
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
