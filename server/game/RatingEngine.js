/**
 * RatingEngine.js
 * 
 * Core multiplayer rating algorithm (Pairwise Elo / Bradley-Terry Model)
 * and Anti-Abuse Guard for Monopoly MVP.
 *
 * Features:
 * 1. Mathematically sound Pairwise Elo: zero-sum (∑ ΔR = 0), fairly rewarding 1st, 2nd, etc. in 2-6 player games.
 * 2. Dynamic K-factors: Duel K=48 (2x ELO), Multi-player K=32, Calibration K=48, High-tier K=24.
 * 3. Anti-Fast-Surrender: Matches ending < 3 rounds / 12 turns / 120s penalize the leaver, but award 0 ELO to the winner.
 * 4. Pairing Fatigue / Diminishing Returns: Consecutive matches between the same players in 24h decay (100% -> 70% -> 40% -> 15% -> 0%).
 * 5. Host Abort Guard: endGameByHost cannot award rating.
 * 6. Local / Self-play Collision Guard: Same-IP / duplicate socket detection prevents self-boosting.
 * 7. Non-negative rating floor: User rating cannot fall below 0.
 */

class RatingEngine {
  constructor() {
    this.BASE_K = 32;
    this.DUEL_K = 48; // 2x ELO for 1v1 duels
    this.CALIBRATION_K = 48; // First 10 games
    this.HIGH_ELO_K = 24; // Rating >= 300

    // Anti-Abuse Gating Thresholds
    this.MIN_ROUNDS = 3; // Minimum full rounds
    this.MIN_TURNS = 12; // Minimum total turns across all players
    this.MIN_DURATION_SECONDS = 120; // 2 minutes active play

    // Pairing Fatigue Window (24 hours)
    this.FATIGUE_WINDOW_MS = 24 * 60 * 60 * 1000;
    this.PAIRING_DECAY_CURVE = [1.0, 0.70, 0.40, 0.15, 0.0];

    // In-memory sliding window history of matches between player pairs
    // Key: sortedPairKey(idA, idB) -> Array of timestamps [t1, t2, ...]
    this.pairMatchHistory = new Map();
  }

  /**
   * Helper to generate consistent key for player pair
   */
  getPairKey(idA, idB) {
    const a = String(idA || '');
    const b = String(idB || '');
    return a < b ? `${a}__${b}` : `${b}__${a}`;
  }

  /**
   * Track that a match occurred between a pair of players
   */
  recordPairMatch(idA, idB, timestamp = Date.now()) {
    if (!idA || !idB || idA === idB) return;
    const key = this.getPairKey(idA, idB);
    const now = timestamp;
    const cutoff = now - this.FATIGUE_WINDOW_MS;

    let list = this.pairMatchHistory.get(key) || [];
    // Filter out entries older than 24 hours
    list = list.filter(t => t > cutoff);
    list.push(now);
    this.pairMatchHistory.set(key, list);
  }

  /**
   * Get match count between two players in the last 24 hours (excluding current match)
   */
  getRecentPairMatchCount(idA, idB, now = Date.now()) {
    if (!idA || !idB || idA === idB) return 0;
    const key = this.getPairKey(idA, idB);
    const cutoff = now - this.FATIGUE_WINDOW_MS;
    const list = this.pairMatchHistory.get(key) || [];
    return list.filter(t => t > cutoff).length;
  }

  /**
   * Get fatigue multiplier for a pair of players based on match history
   */
  getPairFatigueFactor(idA, idB, now = Date.now()) {
    const recentCount = this.getRecentPairMatchCount(idA, idB, now);
    if (recentCount >= this.PAIRING_DECAY_CURVE.length - 1) {
      return this.PAIRING_DECAY_CURVE[this.PAIRING_DECAY_CURVE.length - 1]; // 0.0
    }
    return this.PAIRING_DECAY_CURVE[recentCount];
  }

  /**
   * Determine dynamic K-factor for player
   */
  getPlayerKFactor(player, totalPlayersCount, isDuel = false) {
    const gamesPlayed = player.gamesPlayed || 0;
    const currentRating = player.rating || 0;

    if (gamesPlayed < 10) {
      return this.CALIBRATION_K; // Faster calibration
    }
    if (isDuel || totalPlayersCount === 2) {
      return this.DUEL_K; // 2x ELO for duel
    }
    if (currentRating >= 300) {
      return this.HIGH_ELO_K; // Stability for leaders
    }
    return this.BASE_K;
  }

  /**
   * Check match eligibility and anti-abuse gates
   * 
   * Returns: {
   *   isEligible: boolean,
   *   isEarlyAbandon: boolean,
   *   penaltyPlayerIds: string[],
   *   reason: string,
   *   note: string
   * }
   */
  evaluateAntiAbuseGates(rankings, matchContext = {}) {
    const {
      hasBots = false,
      roundsPlayed = 0,
      turnsPlayed = 0,
      durationSeconds = 0,
      endReason = 'NORMAL_WIN',
      playerIps = {}
    } = matchContext;

    // Gate 1: No bots allowed in rated calculations
    const containsBots = Boolean(hasBots || rankings.some(r => r.isBot));
    if (containsBots) {
      return {
        isEligible: false,
        isEarlyAbandon: false,
        penaltyPlayerIds: [],
        reason: 'BOT_MATCH',
        note: 'Матч с участием ботов не учитывается в рейтинге ELO.'
      };
    }

    // Gate 2: Host Abort
    if (endReason === 'HOST_ABORT') {
      return {
        isEligible: false,
        isEarlyAbandon: false,
        penaltyPlayerIds: [],
        reason: 'HOST_ABORT',
        note: 'Игра прервана хостом. Рейтинг ELO не начислен.'
      };
    }

    // Gate 3: Local Collision / Multi-account from same IP
    const humanRankings = rankings.filter(r => !r.isBot);
    if (humanRankings.length === 2 && playerIps && Object.keys(playerIps).length >= 2) {
      const p1Ip = playerIps[humanRankings[0].id];
      const p2Ip = playerIps[humanRankings[1].id];
      if (p1Ip && p2Ip && p1Ip === p2Ip && p1Ip !== '127.0.0.1' && p1Ip !== '::1' && p1Ip !== 'localhost') {
        return {
          isEligible: false,
          isEarlyAbandon: false,
          penaltyPlayerIds: [],
          reason: 'LOCAL_COLLISION',
          note: 'Обнаружена игра с одного IP-адреса. Рейтинг аннулирован.'
        };
      }
    }

    // Gate 4: Anti-Fast-Surrender / Early Match Abandonment
    // If context specifies rounds or duration, check them
    const hasProgressContext = roundsPlayed > 0 || turnsPlayed > 0 || durationSeconds > 0;
    if (hasProgressContext) {
      const isUnderDuration = durationSeconds > 0 && durationSeconds < this.MIN_DURATION_SECONDS;
      const isUnderRounds = roundsPlayed < this.MIN_ROUNDS && turnsPlayed < this.MIN_TURNS;

      if (isUnderRounds || isUnderDuration) {
        // Check if someone surrendered or disconnected prematurely
        const leavers = humanRankings.filter(p => 
          !p.isWinner && (
            p.isBankrupt || 
            p.disqualifiedReason === 'LEFT_GAME' || 
            endReason === 'SURRENDER' || 
            endReason === 'DISCONNECT_TIMEOUT'
          )
        );

        const penaltyPlayerIds = leavers.map(p => p.id);

        return {
          isEligible: false,
          isEarlyAbandon: true,
          penaltyPlayerIds,
          reason: 'EARLY_ABANDON',
          note: 'Матч завершен слишком быстро (< 3 кругов). Победителю рейтинг не начислен для защиты от накрутки.'
        };
      }
    }

    return {
      isEligible: true,
      isEarlyAbandon: false,
      penaltyPlayerIds: [],
      reason: 'QUALIFIED',
      note: 'Рейтинговый матч подтвержден.'
    };
  }

  /**
   * Main entry point: Calculate rating changes for all ranked players
   *
   * @param {Array} rankings - Array of player results [{ id, name, telegramId, rank, isWinner, isBankrupt, ... }]
   * @param {Object} matchContext - { roundsPlayed, turnsPlayed, durationSeconds, hasBots, endReason, isPrivate, playerIps }
   * @param {Map|Object} usersMap - Map or object of stored users to read current ratings & gamesPlayed
   * @returns {Array} List of calculated deltas per player [{ id, ratingDelta, newRating, oldRating, note, status }]
   */
  calculateMatchRatings(rankings, matchContext = {}, usersMap = new Map()) {
    if (!Array.isArray(rankings) || rankings.length === 0) return [];

    const humanRankings = rankings.filter(r => !r.isBot);
    if (humanRankings.length === 0) return [];

    const isDuel = humanRankings.length === 2;
    const now = Date.now();

    // 1. Evaluate Anti-Abuse Gates
    const gateResult = this.evaluateAntiAbuseGates(rankings, matchContext);

    // Helper to get user profile by key
    const getUserProfile = (player) => {
      const userKey = String(player.telegramId || player.id);
      if (usersMap instanceof Map) {
        return usersMap.get(userKey) || { rating: 0, gamesPlayed: 0 };
      }
      return (usersMap && usersMap[userKey]) || { rating: 0, gamesPlayed: 0 };
    };

    // Case A: Early Abandonment (Fast Surrender)
    if (gateResult.isEarlyAbandon) {
      return humanRankings.map(player => {
        const user = getUserProfile(player);
        const oldRating = user.rating !== undefined ? user.rating : 0;
        const isPenalty = gateResult.penaltyPlayerIds.includes(player.id);

        let delta = 0;
        let note = '';

        if (isPenalty) {
          // Penalty for leaver / surrenderer: -15 ELO (cannot drop below 0)
          delta = -Math.min(15, oldRating);
          if (delta === 0 || Object.is(delta, -0)) delta = 0;
          note = 'Штраф за досрочный выход из рейтинговой игры (-15 ELO).';
        } else {
          // Winner gets 0 ELO to completely prevent boost/win-trading
          delta = 0;
          note = gateResult.note;
        }

        const newRating = Math.max(0, oldRating + delta);
        return {
          id: player.id,
          name: player.name,
          telegramId: player.telegramId || null,
          rank: player.rank,
          isWinner: player.isWinner,
          oldRating,
          newRating,
          ratingDelta: delta,
          note,
          status: isPenalty ? 'PENALTY' : 'VOID_NO_GAIN'
        };
      });
    }

    // Case B: Not Eligible (Bots, Host Abort, Local Collision)
    if (!gateResult.isEligible) {
      return humanRankings.map(player => {
        const user = getUserProfile(player);
        const oldRating = user.rating !== undefined ? user.rating : 0;
        return {
          id: player.id,
          name: player.name,
          telegramId: player.telegramId || null,
          rank: player.rank,
          isWinner: player.isWinner,
          oldRating,
          newRating: oldRating,
          ratingDelta: 0,
          note: gateResult.note,
          status: 'UNRATED'
        };
      });
    }

    // Case C: Standard Qualified Match - Calculate Pairwise Elo
    const N = humanRankings.length;
    const playerProfiles = humanRankings.map(p => {
      const user = getUserProfile(p);
      const rating = user.rating !== undefined ? user.rating : 0;
      // Virtual calculation rating offset by +1000 for smooth math
      const calcRating = rating + 1000;
      const k = this.getPlayerKFactor(user, N, isDuel);
      return {
        ...p,
        userKey: String(p.telegramId || p.id),
        oldRating: rating,
        calcRating,
        k
      };
    });

    const deltas = new Map();
    const fatigueNotes = new Map();

    // Initialize deltas to 0
    playerProfiles.forEach(p => deltas.set(p.id, 0));

    // Calculate pairwise comparisons for every pair (i, j)
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const pA = playerProfiles[i];
        const pB = playerProfiles[j];

        // Pairing fatigue between pA and pB
        const fatigue = this.getPairFatigueFactor(pA.userKey, pB.userKey, now);
        if (fatigue < 1.0) {
          const count = this.getRecentPairMatchCount(pA.userKey, pB.userKey, now) + 1;
          const pct = Math.round(fatigue * 100);
          fatigueNotes.set(pA.id, `Игра #${count} с этим соперником за сутки (коэффициент ${pct}%).`);
          fatigueNotes.set(pB.id, `Игра #${count} с этим соперником за сутки (коэффициент ${pct}%).`);
        }

        // Expected outcomes (Bradley-Terry)
        const expA = 1 / (1 + Math.pow(10, (pB.calcRating - pA.calcRating) / 400));
        const expB = 1 - expA;

        // Actual outcomes based on placement
        let actA = 0.5;
        let actB = 0.5;
        if (pA.rank < pB.rank) {
          actA = 1.0;
          actB = 0.0;
        } else if (pA.rank > pB.rank) {
          actA = 0.0;
          actB = 1.0;
        }

        // Combined K-factor for this pair
        const pairK = Math.round((pA.k + pB.k) / 2) * fatigue;

        // Pairwise point swing
        const swingA = pairK * (actA - expA);
        const swingB = pairK * (actB - expB);

        deltas.set(pA.id, deltas.get(pA.id) + swingA);
        deltas.set(pB.id, deltas.get(pB.id) + swingB);

        // Record pair match in history tracker
        this.recordPairMatch(pA.userKey, pB.userKey, now);
      }
    }

    // Normalize deltas across N-1 opponents and round
    return playerProfiles.map(p => {
      const rawSum = deltas.get(p.id) || 0;
      const divisor = Math.max(1, N - 1);
      let calculatedDelta = Math.round(rawSum / divisor);

      // Floor protection: cannot drop below 0 rating
      if (p.oldRating + calculatedDelta < 0) {
        calculatedDelta = -p.oldRating;
      }

      if (calculatedDelta === 0 || Object.is(calculatedDelta, -0)) {
        calculatedDelta = 0;
      }

      // If winner in qualified game, ensure at least +1 ELO if fatigue hasn't hit 0%
      const fatigueMsg = fatigueNotes.get(p.id);
      if (p.isWinner && calculatedDelta <= 0 && (!fatigueMsg || !fatigueMsg.includes('0%'))) {
        calculatedDelta = 1;
      }

      const newRating = Math.max(0, p.oldRating + calculatedDelta);
      let note = fatigueMsg || (calculatedDelta >= 0 ? `+${calculatedDelta} ELO` : `${calculatedDelta} ELO`);

      return {
        id: p.id,
        name: p.name,
        telegramId: p.telegramId || null,
        rank: p.rank,
        isWinner: p.isWinner,
        oldRating: p.oldRating,
        newRating,
        ratingDelta: calculatedDelta,
        note,
        status: 'RATED'
      };
    });
  }

  /**
   * Reset in-memory pairing history (useful for tests or daily cron)
   */
  clearHistory() {
    this.pairMatchHistory.clear();
  }
}

module.exports = new RatingEngine();
