export interface PlayerColor {
  id: string;
  name: string;
  hex: string;
  icon: string;
}

export interface TileData {
  id: number;
  name: string;
  type: string;
  group?: string;
  groupName?: string;
  color?: string;
  price?: number;
  housePrice?: number;
  upgradeCost?: number;
  sellRefund?: number;
  mortgageValue?: number;
  rent?: number;
  rents?: number[];
  amount?: number;
  bonus?: number;
  icon?: string;
  iconUrl?: string;
  description?: string;
  ownerId?: string | null;
  houses?: number;
  isMortgaged?: boolean;
  isMonopoly?: boolean;
  currentRent?: number;
}

export interface PlayerData {
  id: string;
  name: string;
  color: PlayerColor;
  money: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  isBankrupt: boolean;
  isConnected: boolean;
  isBot?: boolean;
  botDifficulty?: 'careful' | 'balanced' | 'aggressive';
  telegramId?: string | null;
  yandexId?: string | null;
  authProvider?: 'telegram' | 'yandex' | null;
  username?: string | null;
  avatarUrl?: string | null;
  characterId?: string;
  disconnectBudgetSeconds?: number;
  activePlaySeconds?: number;
  missedTurns?: number;
  tradeOffersRemaining?: number;
  propertiesCount?: number;
  properties?: number[];
  auctionCooldownUntilTurn?: number;
  netWorth?: number;
  totalCapital?: number;
  propertyValue?: number;
  propertyNominalValue?: number;
  buildingsValue?: number;
  monopoliesCount?: number;
  housesCount?: number;
  hotelsCount?: number;
  rank?: number;
  isWinner?: boolean;
}

export interface ActiveAuction {
  tileId: number;
  tileName?: string;
  tileColor?: string;
  tilePrice?: number;
  groupName?: string;
  currentBid: number;
  isDirectOffer?: boolean;
  targetPlayerId?: string | null;
  targetPlayerName?: string | null;
  targetId?: string | null;
  initiatorId?: string | null;
  initiatorName?: string | null;
  highestBidderId: string | null;
  highestBidderName?: string | null;
  highestBidderColor?: string | null;
  activeBidders?: string[];
  passedBidders?: string[];
  activePlayerIds?: string[];
  passedPlayerIds?: string[];
  startedAt?: number;
  endsAt?: number;
  timerSeconds?: number;
  remainingSeconds?: number;
  turnTimeLimitSeconds?: number;
  isCompleted?: boolean;
}

export interface ActiveTrade {
  id?: string;
  tradeId?: string;
  initiatorId?: string;
  targetId?: string;
  fromPlayerId?: string;
  fromPlayerName?: string;
  toPlayerId?: string;
  toPlayerName?: string;
  offer?: {
    money: number;
    properties: number[];
    jailFreeCards?: number;
  };
  request?: {
    money: number;
    properties: number[];
    jailFreeCards?: number;
  };
  offerProperties?: number[];
  offerCash?: number;
  requestProperties?: number[];
  requestCash?: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'DECLINED';
  createdAt?: number;
}

export interface GameLog {
  id: string;
  timestamp: number;
  text?: string;
  message?: string;
  type: string;
  icon?: string;
  playerName?: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  senderName: string;
  senderColor?: string;
  senderIcon?: string;
  message: string;
  timestamp: number;
  playerName?: string;
  text?: string;
}

export interface RankingPlayer extends PlayerData {
  rank: number;
  isWinner: boolean;
  totalCapital: number;
  netWorth: number;
  propertyValue: number;
  propertyNominalValue?: number;
  buildingsValue?: number;
  monopoliesCount: number;
  housesCount: number;
  hotelsCount: number;
}

export interface DiceObject {
  die1: number;
  die2: number;
  sum?: number;
  isDouble?: boolean;
}

export interface DrawnCardData {
  id: string;
  title: string;
  text: string;
  type: string;
  amount?: number;
  amountPerPlayer?: number;
  houseCost?: number;
  hotelCost?: number;
  icon?: string;
  deckType: 'chance' | 'chest';
  playerName: string;
  playerId: string;
  drawnAt: number;
}

export interface GameState {
  roomId: string;
  hostId: string;
  status: 'LOBBY' | 'ROLLING' | 'ACTION' | 'AWAITING_ACTION' | 'TURN_END' | 'AUCTION' | 'TRADE' | 'GAME_OVER';
  isPrivate: boolean;
  mode?: 'standard' | 'blitz' | 'ranked';
  gameMode?: 'classic' | 'reverse';
  maxRounds?: number;
  boardSize?: number;
  hasBots?: boolean;
  currentTurnIndex: number;
  turnNumber?: number;
  roundNumber?: number;
  currentPlayerId: string | null;
  lastDice: DiceObject | [number, number] | null;
  lastDrawnCard?: DrawnCardData | null;
  pendingAction: {
    type: string;
    tileId?: number;
    price?: number;
    amount?: number;
    card?: any;
  } | null;
  activeAuction: ActiveAuction | null;
  activeTrade: ActiveTrade | null;
  tradeOffersThisRound?: Record<string, number>;
  builtTilesThisTurn?: number[];
  disconnectWaitingState: {
    disconnectedPlayerId: string;
    disconnectedPlayerName: string;
    remainingSeconds: number;
  } | null;
  winner: PlayerData | null;
  gameDurationSeconds: number;
  remainingTurnSeconds: number;
  stats: {
    turnsCount?: number;
    totalMoneyCirculating?: number;
    housesBuilt?: number;
    hotelsBuilt?: number;
  };
  rankings: RankingPlayer[];
  board: TileData[];
  players: PlayerData[];
  logs: GameLog[];
}

export interface PublicRoomSummary {
  roomId: string;
  hostName: string;
  playersCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  mode?: string;
  gameMode?: 'classic' | 'reverse';
  maxRounds?: number;
  boardSize?: number;
  status: string;
  players: Array<{
    id: string;
    name: string;
    color: PlayerColor;
  }>;
}

export interface AuthUser {
  telegramId: string | number;
  yandexId?: string;
  provider?: 'telegram' | 'yandex' | 'guest';
  firstName: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  rating?: number;
  wins?: number;
  gamesWon?: number;
  losses?: number;
  gamesPlayed?: number;
  winRate?: number;
  totalMoneyEarned?: number;
  botGamesPlayed?: number;
  botWins?: number;
}
export type TelegramUser = AuthUser;

export interface LeaderboardEntry {
  telegramId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  rating: number;
  wins: number;
  gamesPlayed: number;
  winRate: number;
}
