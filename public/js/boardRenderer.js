/**
 * Board Renderer: handles 7x7 perimeter grid, tile rendering, ownership indicators, and animated pawns
 */
class BoardRenderer {
  constructor(boardContainerId) {
    this.container = document.getElementById(boardContainerId);
    this.tileElements = [];
    this.isAnimatingMovement = false;
  }

  // Calculate CSS grid row & column for tile index 0..23
  getTileGridCoordinates(index) {
    if (index >= 0 && index <= 6) {
      // Bottom row (left to right: col 1..7, row 7)
      return { row: 7, col: index + 1 };
    } else if (index >= 7 && index <= 11) {
      // Right col (bottom to top: col 7, row 6..2)
      return { row: 7 - (index - 6), col: 7 };
    } else if (index === 12) {
      // Top-right corner
      return { row: 1, col: 7 };
    } else if (index >= 13 && index <= 17) {
      // Top row (right to left: col 6..2, row 1)
      return { row: 1, col: 7 - (index - 12) };
    } else if (index === 18) {
      // Top-left corner
      return { row: 1, col: 1 };
    } else if (index >= 19 && index <= 23) {
      // Left col (top to bottom: col 1, row 2..6)
      return { row: index - 18 + 1, col: 1 };
    }
    return { row: 1, col: 1 };
  }

  init(tiles) {
    if (!this.container) return;
    
    // Remove existing tile elements, preserve center dashboard
    const existingTiles = this.container.querySelectorAll('.board-tile');
    existingTiles.forEach(el => el.remove());
    this.tileElements = [];

    tiles.forEach((tile, index) => {
      const coords = this.getTileGridCoordinates(index);
      const tileEl = document.createElement('div');
      tileEl.className = `board-tile tile-${tile.type} tile-index-${index}`;
      tileEl.id = `tile-${index}`;
      tileEl.style.gridRow = coords.row;
      tileEl.style.gridColumn = coords.col;

      let colorHeader = '';
      if (tile.type === 'property' && tile.color) {
        colorHeader = `<div class="tile-header-bar" style="background-color: ${tile.color};">
          <span class="group-label">${tile.groupName || ''}</span>
        </div>`;
      }

      let badgeHtml = '';
      if (tile.type === 'property') {
        badgeHtml = `<div class="tile-price">$${tile.price}</div>`;
      } else if (tile.type === 'tax') {
        badgeHtml = `<div class="tile-price tax-badge">-$${tile.amount}</div>`;
      } else if (tile.type === 'start') {
        badgeHtml = `<div class="tile-price bonus-badge">+$200</div>`;
      }

      let iconHtml = tile.icon || '📍';
      if (window.PixelIcons && typeof window.PixelIcons.getTileIcon === 'function') {
        iconHtml = window.PixelIcons.getTileIcon(index, tile);
      }

      tileEl.innerHTML = `
        ${colorHeader}
        <div class="tile-buildings-container" id="tile-buildings-${index}"></div>
        <div class="mortgage-tag-overlay" id="mortgage-overlay-${index}" style="display: none;">ЗАЛОЖЕНО</div>
        <div class="tile-body">
          <div class="tile-icon">${iconHtml}</div>
          <div class="tile-name" title="${tile.name}">${tile.name}</div>
          ${badgeHtml}
          <div class="tile-owner-badge" id="owner-badge-${index}" style="display: none;"></div>
        </div>
        <div class="tile-tokens-container" id="tile-tokens-${index}"></div>
      `;

      tileEl.addEventListener('click', () => {
        if (this.onTileClickListener) {
          this.onTileClickListener(index, tile);
        }
      });

      this.container.appendChild(tileEl);
      this.tileElements.push(tileEl);
    });
  }

  setOnTileClickListener(listener) {
    this.onTileClickListener = listener;
  }

  updateBoardState(state) {
    if (!state || !state.board) return;

    // Update ownership badges, buildings, mortgages, and monopolies on tiles
    state.board.forEach((tile, index) => {
      const badge = document.getElementById(`owner-badge-${index}`);
      const tileEl = document.getElementById(`tile-${index}`);
      const buildingsEl = document.getElementById(`tile-buildings-${index}`);
      const mortgageEl = document.getElementById(`mortgage-overlay-${index}`);
      if (!badge || !tileEl) return;

      // Ownership badge
      if (tile.ownerId) {
        const owner = state.players.find(p => p.id === tile.ownerId);
        if (owner) {
          badge.style.display = 'flex';
          badge.style.backgroundColor = owner.color.hex;
          badge.style.color = owner.color.text;
          badge.innerHTML = `<span class="owner-icon">${owner.color.icon}</span> <span class="owner-name">${owner.name}</span>`;
          tileEl.classList.add('is-owned');
        } else {
          badge.style.display = 'none';
          tileEl.classList.remove('is-owned');
        }
      } else {
        badge.style.display = 'none';
        tileEl.classList.remove('is-owned');
      }

      // Monopoly Highlight
      if (tile.isMonopoly) {
        tileEl.classList.add('is-monopoly');
      } else {
        tileEl.classList.remove('is-monopoly');
      }

      // Mortgage Status
      if (tile.isMortgaged) {
        tileEl.classList.add('is-mortgaged');
        if (mortgageEl) mortgageEl.style.display = 'block';
      } else {
        tileEl.classList.remove('is-mortgaged');
        if (mortgageEl) mortgageEl.style.display = 'none';
      }

      // Buildings (Houses / Hotels)
      if (buildingsEl) {
        buildingsEl.innerHTML = '';
        if (tile.houses > 0 && !tile.isMortgaged) {
          const hotelSvg = (window.PixelIcons && window.PixelIcons.HOTEL) ? window.PixelIcons.HOTEL : '🏨';
          const houseSvg = (window.PixelIcons && window.PixelIcons.HOUSE) ? window.PixelIcons.HOUSE : '🏠';

          if (tile.houses === 5) {
            // Hotel
            buildingsEl.innerHTML = `<span class="building-token hotel-token" title="Отель (Рента: $${tile.currentRent})">${hotelSvg}</span>`;
          } else {
            // 1..4 Houses
            let housesHtml = '';
            for (let h = 0; h < tile.houses; h++) {
              housesHtml += `<span class="building-token house-token" title="${tile.houses} дома (Рента: $${tile.currentRent})">${houseSvg}</span>`;
            }
            buildingsEl.innerHTML = housesHtml;
          }
        }
      }
    });

    // Highlight active player's tile
    const currentPlayer = state.players[state.currentTurnIndex];
    this.tileElements.forEach((el, idx) => {
      if (currentPlayer && currentPlayer.position === idx) {
        el.classList.add('current-turn-tile');
      } else {
        el.classList.remove('current-turn-tile');
      }
    });

    // Render tokens if not animating movement
    if (!this.isAnimatingMovement) {
      this.renderPlayerTokens(state.players);
    }
  }

  renderPlayerTokens(players) {
    if (!players) return;

    // Place or move tokens for all active (non-bankrupt) players
    players.forEach(player => {
      if (player.isBankrupt) {
        const existingToken = document.getElementById(`token-${player.id}`);
        if (existingToken) existingToken.remove();
        return;
      }

      const targetPos = Math.max(0, Math.min(23, player.position));
      const tokensContainer = document.getElementById(`tile-tokens-${targetPos}`);
      if (!tokensContainer) return;

      let tokenEl = document.getElementById(`token-${player.id}`);
      if (!tokenEl) {
        tokenEl = document.createElement('div');
        tokenEl.className = `player-token token-${player.id}`;
        tokenEl.id = `token-${player.id}`;
        tokenEl.style.backgroundColor = player.color.hex;
        tokenEl.style.borderColor = '#FFFFFF';
        tokenEl.title = `${player.name} (${player.color.name})`;
        tokenEl.innerHTML = `<span class="token-emoji">${player.color.icon}</span>`;
        tokensContainer.appendChild(tokenEl);
      } else {
        // Move to target container only if needed
        if (tokenEl.parentElement !== tokensContainer) {
          tokensContainer.appendChild(tokenEl);
        }
      }
    });

    // Remove any orphaned tokens
    const currentIds = new Set(players.filter(p => !p.isBankrupt).map(p => `token-${p.id}`));
    document.querySelectorAll('.player-token').forEach(el => {
      if (!currentIds.has(el.id)) {
        el.remove();
      }
    });
  }

  async animatePlayerMovement(playerId, oldPos, newPos, players, onStep, onComplete) {
    this.isAnimatingMovement = true;
    const player = players ? players.find(p => p.id === playerId) : null;

    const totalTiles = 24;
    let steps = (newPos - oldPos + totalTiles) % totalTiles;
    if (steps === 0 && newPos !== oldPos) steps = totalTiles; // full lap if same pos
    if (steps === 0) steps = 0; // teleports or no moves

    // If teleport (e.g. Go to Jail or move_to chance)
    const isDirectTeleport = steps > 12;

    let tokenEl = document.getElementById(`token-${playerId}`);
    if (!tokenEl && players) {
      this.renderPlayerTokens(players);
      tokenEl = document.getElementById(`token-${playerId}`);
    }

    if (isDirectTeleport || steps === 0) {
      if (player) player.position = newPos;
      const targetContainer = document.getElementById(`tile-tokens-${newPos}`);
      if (targetContainer && tokenEl) {
        targetContainer.appendChild(tokenEl);
      }
      const targetTileEl = document.getElementById(`tile-${newPos}`);
      if (targetTileEl) {
        targetTileEl.classList.add('tile-pulse');
        setTimeout(() => targetTileEl.classList.remove('tile-pulse'), 1000);
      }
      this.isAnimatingMovement = false;
      if (players) this.renderPlayerTokens(players);
      if (onComplete) onComplete();
      return;
    }

    // Step-by-step movement: only move the active player's token
    let currentStepPos = oldPos;
    const speedSetting = localStorage.getItem('monopoly_saved_anim_speed');
    const stepDuration = speedSetting !== null ? Number(speedSetting) : 180;

    if (tokenEl) {
      tokenEl.classList.add('is-hopping');
    }

    for (let s = 1; s <= steps; s++) {
      currentStepPos = (currentStepPos + 1) % totalTiles;
      
      const tokensContainer = document.getElementById(`tile-tokens-${currentStepPos}`);
      if (tokensContainer && tokenEl) {
        tokensContainer.appendChild(tokenEl);
      }

      if (window.soundEngine) {
        window.soundEngine.playStep();
      }

      if (onStep) onStep(currentStepPos, s === steps);

      await new Promise(r => setTimeout(r, stepDuration));
    }

    if (tokenEl) {
      tokenEl.classList.remove('is-hopping');
    }

    // Update player position explicitly to destination
    if (player) {
      player.position = newPos;
    }

    // Guarantee token is in final destination container
    const finalTokensContainer = document.getElementById(`tile-tokens-${newPos}`);
    if (finalTokensContainer && tokenEl) {
      finalTokensContainer.appendChild(tokenEl);
    }

    // Pulse final tile
    const finalTileEl = document.getElementById(`tile-${newPos}`);
    if (finalTileEl) {
      finalTileEl.classList.add('tile-pulse');
      setTimeout(() => finalTileEl.classList.remove('tile-pulse'), 800);
    }

    this.isAnimatingMovement = false;
    if (players) {
      this.renderPlayerTokens(players);
    }
    if (onComplete) onComplete();
  }
}

window.BoardRenderer = BoardRenderer;
