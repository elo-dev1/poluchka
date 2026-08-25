/**
 * PixelArt SVG Icon Library for Monopoly Board
 * High-definition crisp vector pixel-art icons with shape-rendering="crispEdges"
 */
const PixelIcons = (() => {
  // Common wrapper for pixel-art SVG
  const wrap = (content, viewBox = "0 0 16 16", extraClass = "") => `
    <svg viewBox="${viewBox}" class="pixel-icon ${extraClass}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      ${content}
    </svg>
  `;

  // 1. START: Pixel Blazing Rocket (id: 0)
  const START = wrap(`
    <rect x="7" y="1" width="2" height="2" fill="#FFFFFF"/>
    <rect x="6" y="3" width="4" height="2" fill="#E53935"/>
    <rect x="5" y="5" width="6" height="4" fill="#FAFAFA"/>
    <rect x="7" y="6" width="2" height="2" fill="#03A9F4"/>
    <rect x="5" y="9" width="6" height="2" fill="#E53935"/>
    <rect x="4" y="8" width="1" height="4" fill="#D32F2F"/>
    <rect x="11" y="8" width="1" height="4" fill="#D32F2F"/>
    <rect x="3" y="11" width="1" height="2" fill="#B71C1C"/>
    <rect x="12" y="11" width="1" height="2" fill="#B71C1C"/>
    <rect x="6" y="11" width="4" height="1" fill="#FF9800"/>
    <rect x="7" y="12" width="2" height="2" fill="#FFEB3B"/>
    <rect x="7" y="14" width="2" height="1" fill="#FF5722"/>
  `);

  // 2. CRAFTSMEN: Pixel Crossed Hammer & Wood (id: 1)
  const WOOD = wrap(`
    <rect x="2" y="5" width="12" height="6" fill="#8D6E63"/>
    <rect x="4" y="6" width="8" height="4" fill="#A1887F"/>
    <rect x="6" y="7" width="4" height="2" fill="#6D4C41"/>
    <rect x="2" y="4" width="2" height="1" fill="#5D4037"/>
    <rect x="12" y="4" width="2" height="1" fill="#5D4037"/>
    <rect x="7" y="1" width="2" height="3" fill="#B0BEC5"/>
    <rect x="6" y="2" width="4" height="2" fill="#ECEFF1"/>
    <rect x="7" y="4" width="2" height="11" fill="#FFA726"/>
    <rect x="8" y="4" width="1" height="11" fill="#FB8C00"/>
  `);

  // 3. CHANCE: Pixel Gold Mystery Question Block (id: 2, 14)
  const CHANCE = wrap(`
    <rect x="1" y="1" width="14" height="14" fill="#F57C00"/>
    <rect x="2" y="2" width="12" height="12" fill="#FFB300"/>
    <rect x="3" y="3" width="10" height="10" fill="#FFC107"/>
    <rect x="2" y="2" width="1" height="1" fill="#FFE082"/>
    <rect x="13" y="2" width="1" height="1" fill="#FFE082"/>
    <rect x="2" y="13" width="1" height="1" fill="#FFE082"/>
    <rect x="13" y="13" width="1" height="1" fill="#FFE082"/>
    <!-- Question mark -->
    <rect x="5" y="4" width="6" height="2" fill="#FFFFFF"/>
    <rect x="9" y="5" width="2" height="3" fill="#FFFFFF"/>
    <rect x="7" y="7" width="3" height="2" fill="#FFFFFF"/>
    <rect x="7" y="9" width="2" height="1" fill="#FFFFFF"/>
    <rect x="7" y="11" width="2" height="2" fill="#FFFFFF"/>
    <rect x="6" y="5" width="4" height="1" fill="#FFF9C4"/>
  `);

  // 4. ANCHOR: Pixel Marine Anchor (id: 3)
  const ANCHOR = wrap(`
    <rect x="7" y="1" width="2" height="2" fill="#ECEFF1"/>
    <rect x="6" y="2" width="4" height="2" fill="#CFD8DC"/>
    <rect x="7" y="2" width="2" height="2" fill="#37474F"/>
    <rect x="7" y="4" width="2" height="8" fill="#ECEFF1"/>
    <rect x="4" y="6" width="8" height="2" fill="#B0BEC5"/>
    <rect x="3" y="8" width="2" height="4" fill="#90A4AE"/>
    <rect x="11" y="8" width="2" height="4" fill="#90A4AE"/>
    <rect x="4" y="11" width="8" height="2" fill="#ECEFF1"/>
    <rect x="2" y="8" width="2" height="2" fill="#CFD8DC"/>
    <rect x="12" y="8" width="2" height="2" fill="#CFD8DC"/>
    <rect x="7" y="13" width="2" height="2" fill="#B0BEC5"/>
  `);

  // 5. CITY TAX: Pixel Gold Coin Pouch (id: 4)
  const TAX = wrap(`
    <rect x="6" y="2" width="4" height="2" fill="#8D6E63"/>
    <rect x="5" y="4" width="6" height="2" fill="#D32F2F"/>
    <rect x="4" y="6" width="8" height="8" fill="#A1887F"/>
    <rect x="3" y="7" width="10" height="6" fill="#8D6E63"/>
    <rect x="5" y="7" width="6" height="6" fill="#FFD54F"/>
    <!-- Dollar sign -->
    <rect x="7" y="8" width="2" height="4" fill="#E65100"/>
    <rect x="6" y="8" width="4" height="1" fill="#E65100"/>
    <rect x="6" y="11" width="4" height="1" fill="#E65100"/>
    <rect x="7" y="7" width="2" height="6" fill="#FFE082"/>
    <rect x="7" y="8" width="2" height="4" fill="#BF360C"/>
  `);

  // 6. DOVE / PEACE PROSPECT: Pixel White Flying Dove (id: 5)
  const DOVE = wrap(`
    <rect x="8" y="2" width="4" height="3" fill="#ECEFF1"/>
    <rect x="11" y="3" width="2" height="2" fill="#FFB300"/>
    <rect x="10" y="3" width="1" height="1" fill="#212121"/>
    <rect x="5" y="4" width="5" height="5" fill="#FFFFFF"/>
    <rect x="3" y="3" width="4" height="3" fill="#CFD8DC"/>
    <rect x="1" y="2" width="3" height="3" fill="#ECEFF1"/>
    <rect x="4" y="9" width="6" height="3" fill="#ECEFF1"/>
    <rect x="6" y="12" width="2" height="2" fill="#FFB300"/>
    <rect x="2" y="10" width="3" height="2" fill="#B0BEC5"/>
  `);

  // 7. JAIL: Pixel Prison Bars & Brass Padlock (id: 6)
  const JAIL = wrap(`
    <rect x="1" y="1" width="14" height="2" fill="#455A64"/>
    <rect x="1" y="13" width="14" height="2" fill="#455A64"/>
    <rect x="3" y="3" width="2" height="10" fill="#78909C"/>
    <rect x="7" y="3" width="2" height="10" fill="#78909C"/>
    <rect x="11" y="3" width="2" height="10" fill="#78909C"/>
    <!-- Padlock -->
    <rect x="6" y="7" width="4" height="3" fill="#FFC107"/>
    <rect x="7" y="5" width="2" height="2" fill="#FFA000"/>
    <rect x="7" y="8" width="2" height="2" fill="#37474F"/>
  `);

  // 8. TROPHY: Pixel Golden Victory Cup (id: 7)
  const TROPHY = wrap(`
    <rect x="4" y="2" width="8" height="5" fill="#FFD54F"/>
    <rect x="5" y="3" width="6" height="4" fill="#FFECB3"/>
    <rect x="2" y="3" width="2" height="3" fill="#FFA000"/>
    <rect x="12" y="3" width="2" height="3" fill="#FFA000"/>
    <rect x="5" y="7" width="6" height="2" fill="#FFC107"/>
    <rect x="6" y="9" width="4" height="2" fill="#FFA000"/>
    <rect x="7" y="10" width="2" height="2" fill="#FFD54F"/>
    <rect x="4" y="12" width="8" height="2" fill="#6D4C41"/>
    <rect x="5" y="13" width="6" height="1" fill="#8D6E63"/>
    <rect x="7" y="4" width="2" height="2" fill="#FFFFFF"/>
  `);

  // 9. CHEST: Pixel Golden RPG Treasure Chest (id: 8, 21)
  const CHEST = wrap(`
    <rect x="2" y="3" width="12" height="5" fill="#8D6E63"/>
    <rect x="3" y="4" width="10" height="3" fill="#A1887F"/>
    <rect x="1" y="7" width="14" height="2" fill="#4E342E"/>
    <rect x="2" y="8" width="12" height="6" fill="#6D4C41"/>
    <rect x="2" y="3" width="1" height="11" fill="#FFD54F"/>
    <rect x="13" y="3" width="1" height="11" fill="#FFD54F"/>
    <rect x="7" y="3" width="2" height="11" fill="#FFD54F"/>
    <!-- Lock -->
    <rect x="7" y="7" width="2" height="3" fill="#FFF9C4"/>
    <rect x="7" y="9" width="2" height="1" fill="#212121"/>
  `);

  // 10. THEATER: Pixel Drama/Comedy Masks (id: 9)
  const THEATER = wrap(`
    <!-- Left Mask (Happy) -->
    <rect x="2" y="3" width="6" height="8" fill="#FFF59D"/>
    <rect x="3" y="4" width="1" height="2" fill="#37474F"/>
    <rect x="6" y="4" width="1" height="2" fill="#37474F"/>
    <rect x="4" y="8" width="3" height="2" fill="#D32F2F"/>
    <rect x="3" y="7" width="1" height="1" fill="#D32F2F"/>
    <rect x="7" y="7" width="1" height="1" fill="#D32F2F"/>
    <!-- Right Mask (Drama) -->
    <rect x="8" y="5" width="6" height="8" fill="#CE93D8"/>
    <rect x="9" y="6" width="1" height="2" fill="#37474F"/>
    <rect x="12" y="6" width="1" height="2" fill="#37474F"/>
    <rect x="10" y="10" width="2" height="2" fill="#4A148C"/>
    <rect x="9" y="11" width="1" height="1" fill="#4A148C"/>
    <rect x="12" y="11" width="1" height="1" fill="#4A148C"/>
  `);

  // 11. MUSEUM: Pixel Classical Temple & Columns (id: 10)
  const MUSEUM = wrap(`
    <rect x="2" y="2" width="12" height="2" fill="#ECEFF1"/>
    <rect x="4" y="1" width="8" height="1" fill="#CFD8DC"/>
    <rect x="7" y="0" width="2" height="1" fill="#B0BEC5"/>
    <rect x="3" y="4" width="10" height="1" fill="#B0BEC5"/>
    <!-- Columns -->
    <rect x="3" y="5" width="2" height="7" fill="#ECEFF1"/>
    <rect x="7" y="5" width="2" height="7" fill="#ECEFF1"/>
    <rect x="11" y="5" width="2" height="7" fill="#ECEFF1"/>
    <!-- Steps -->
    <rect x="2" y="12" width="12" height="1" fill="#CFD8DC"/>
    <rect x="1" y="13" width="14" height="2" fill="#90A4AE"/>
  `);

  // 12. ARCHITECT: Pixel Triangle & Ruler (id: 11)
  const ARCHITECT = wrap(`
    <rect x="2" y="2" width="2" height="12" fill="#FFA726"/>
    <rect x="2" y="12" width="12" height="2" fill="#FFA726"/>
    <rect x="4" y="4" width="2" height="2" fill="#FFCC80"/>
    <rect x="6" y="6" width="2" height="2" fill="#FFCC80"/>
    <rect x="8" y="8" width="2" height="2" fill="#FFCC80"/>
    <rect x="10" y="10" width="2" height="2" fill="#FFCC80"/>
    <rect x="12" y="12" width="2" height="2" fill="#FFB74D"/>
    <!-- Compass needle -->
    <rect x="8" y="2" width="2" height="6" fill="#00E5FF"/>
    <rect x="6" y="4" width="6" height="2" fill="#00B0FF"/>
  `);

  // 13. FREE PARKING: Pixel Retro Sports Car (id: 12)
  const FREE_PARKING = wrap(`
    <rect x="3" y="5" width="10" height="3" fill="#E53935"/>
    <rect x="5" y="3" width="6" height="3" fill="#E53935"/>
    <rect x="6" y="4" width="4" height="2" fill="#E0F7FA"/>
    <rect x="2" y="7" width="12" height="4" fill="#C62828"/>
    <!-- Headlights -->
    <rect x="13" y="8" width="1" height="2" fill="#FFEE58"/>
    <rect x="2" y="8" width="1" height="2" fill="#FF7043"/>
    <!-- Wheels -->
    <rect x="4" y="10" width="3" height="3" fill="#212121"/>
    <rect x="5" y="11" width="1" height="1" fill="#B0BEC5"/>
    <rect x="10" y="10" width="3" height="3" fill="#212121"/>
    <rect x="11" y="11" width="1" height="1" fill="#B0BEC5"/>
  `);

  // 14. TECH: Pixel Cyber Monitor / Microchip (id: 13)
  const TECH = wrap(`
    <rect x="2" y="2" width="12" height="9" fill="#37474F"/>
    <rect x="3" y="3" width="10" height="7" fill="#00E676"/>
    <!-- Terminal code -->
    <rect x="4" y="4" width="4" height="1" fill="#1B5E20"/>
    <rect x="4" y="6" width="7" height="1" fill="#1B5E20"/>
    <rect x="4" y="8" width="3" height="1" fill="#1B5E20"/>
    <rect x="7" y="11" width="2" height="2" fill="#455A64"/>
    <rect x="5" y="13" width="6" height="1" fill="#263238"/>
  `);

  // 15. SUN: Pixel Radiant Sun (id: 15)
  const SUN = wrap(`
    <rect x="5" y="5" width="6" height="6" fill="#FFEA00"/>
    <rect x="6" y="6" width="4" height="4" fill="#FFF9C4"/>
    <!-- Flares -->
    <rect x="7" y="1" width="2" height="3" fill="#FF6D00"/>
    <rect x="7" y="12" width="2" height="3" fill="#FF6D00"/>
    <rect x="1" y="7" width="3" height="2" fill="#FF6D00"/>
    <rect x="12" y="7" width="3" height="2" fill="#FF6D00"/>
    <rect x="3" y="3" width="2" height="2" fill="#FF9100"/>
    <rect x="11" y="3" width="2" height="2" fill="#FF9100"/>
    <rect x="3" y="11" width="2" height="2" fill="#FF9100"/>
    <rect x="11" y="11" width="2" height="2" fill="#FF9100"/>
  `);

  // 16. TREE: Pixel Lush Oak Tree (id: 16)
  const TREE = wrap(`
    <rect x="4" y="2" width="8" height="6" fill="#43A047"/>
    <rect x="3" y="4" width="10" height="5" fill="#2E7D32"/>
    <rect x="5" y="3" width="4" height="3" fill="#81C784"/>
    <rect x="7" y="8" width="2" height="6" fill="#6D4C41"/>
    <rect x="6" y="11" width="4" height="3" fill="#5D4037"/>
    <rect x="5" y="13" width="6" height="1" fill="#4E342E"/>
  `);

  // 17. ECO TAX: Pixel Emerald Leaf (id: 17)
  const ECO = wrap(`
    <rect x="6" y="2" width="4" height="3" fill="#76FF03"/>
    <rect x="4" y="4" width="8" height="6" fill="#64DD17"/>
    <rect x="3" y="6" width="10" height="4" fill="#00E676"/>
    <rect x="5" y="8" width="6" height="4" fill="#00C853"/>
    <rect x="7" y="3" width="2" height="9" fill="#CCFF90"/>
    <rect x="7" y="11" width="3" height="4" fill="#33691E"/>
  `);

  // 18. GO TO JAIL: Pixel Police Siren / Flashing Beacon (id: 18)
  const GO_TO_JAIL = wrap(`
    <rect x="4" y="3" width="8" height="7" fill="#2979FF"/>
    <rect x="8" y="3" width="4" height="7" fill="#FF1744"/>
    <rect x="6" y="4" width="2" height="4" fill="#FFFFFF"/>
    <rect x="3" y="10" width="10" height="3" fill="#37474F"/>
    <rect x="2" y="13" width="12" height="2" fill="#212121"/>
    <!-- Light rays -->
    <rect x="1" y="2" width="2" height="2" fill="#2979FF"/>
    <rect x="13" y="2" width="2" height="2" fill="#FF1744"/>
    <rect x="7" y="0" width="2" height="2" fill="#FFEA00"/>
  `);

  // 19. WAVE: Pixel Ocean Wave (id: 19)
  const WAVE = wrap(`
    <rect x="8" y="2" width="4" height="2" fill="#E0F7FA"/>
    <rect x="6" y="3" width="6" height="3" fill="#FFFFFF"/>
    <rect x="4" y="5" width="8" height="4" fill="#00B0FF"/>
    <rect x="2" y="8" width="12" height="4" fill="#0091EA"/>
    <rect x="1" y="11" width="14" height="4" fill="#01579B"/>
    <rect x="10" y="5" width="4" height="2" fill="#E0F7FA"/>
  `);

  // 20. PALM: Pixel Tropical Palm Tree (id: 20)
  const PALM = wrap(`
    <rect x="6" y="2" width="4" height="2" fill="#76FF03"/>
    <rect x="3" y="3" width="4" height="2" fill="#64DD17"/>
    <rect x="9" y="3" width="4" height="2" fill="#64DD17"/>
    <rect x="1" y="4" width="4" height="2" fill="#33691E"/>
    <rect x="11" y="4" width="4" height="2" fill="#33691E"/>
    <!-- Trunk -->
    <rect x="7" y="4" width="2" height="9" fill="#8D6E63"/>
    <rect x="6" y="8" width="3" height="2" fill="#6D4C41"/>
    <rect x="4" y="13" width="8" height="2" fill="#FFD54F"/>
  `);

  // 21. DIAMOND: Pixel Glowing Cyan Gemstone (id: 22)
  const DIAMOND = wrap(`
    <rect x="5" y="3" width="6" height="2" fill="#84FFFF"/>
    <rect x="3" y="5" width="10" height="2" fill="#18FFFF"/>
    <rect x="4" y="7" width="8" height="2" fill="#00E5FF"/>
    <rect x="5" y="9" width="6" height="2" fill="#00B0FF"/>
    <rect x="6" y="11" width="4" height="2" fill="#0091EA"/>
    <rect x="7" y="13" width="2" height="1" fill="#01579B"/>
    <rect x="6" y="4" width="3" height="3" fill="#FFFFFF"/>
  `);

  // 22. CROWN: Pixel Imperial Royal Crown (id: 23)
  const CROWN = wrap(`
    <rect x="2" y="5" width="2" height="6" fill="#FFD54F"/>
    <rect x="7" y="3" width="2" height="8" fill="#FFD54F"/>
    <rect x="12" y="5" width="2" height="6" fill="#FFD54F"/>
    <rect x="4" y="7" width="8" height="4" fill="#FFA000"/>
    <rect x="2" y="11" width="12" height="3" fill="#FFC107"/>
    <!-- Gems -->
    <rect x="2" y="4" width="2" height="2" fill="#FF1744"/>
    <rect x="7" y="2" width="2" height="2" fill="#00E5FF"/>
    <rect x="12" y="4" width="2" height="2" fill="#76FF03"/>
    <rect x="4" y="12" width="2" height="1" fill="#D500F9"/>
    <rect x="7" y="12" width="2" height="1" fill="#FF1744"/>
    <rect x="10" y="12" width="2" height="1" fill="#00E5FF"/>
  `);

  // 23. BUILDINGS: House & Hotel
  const HOUSE = wrap(`
    <rect x="6" y="3" width="4" height="2" fill="#66BB6A"/>
    <rect x="4" y="5" width="8" height="2" fill="#4CAF50"/>
    <rect x="2" y="7" width="12" height="2" fill="#388E3C"/>
    <rect x="3" y="9" width="10" height="5" fill="#2E7D32"/>
    <!-- Window & Door -->
    <rect x="5" y="10" width="2" height="2" fill="#FFF59D"/>
    <rect x="9" y="10" width="2" height="4" fill="#1B5E20"/>
  `, "0 0 16 16", "pixel-building-house");

  const HOTEL = wrap(`
    <rect x="4" y="1" width="8" height="13" fill="#E53935"/>
    <rect x="3" y="14" width="10" height="1" fill="#B71C1C"/>
    <!-- Windows -->
    <rect x="6" y="3" width="1" height="1" fill="#FFF59D"/>
    <rect x="9" y="3" width="1" height="1" fill="#FFF59D"/>
    <rect x="6" y="6" width="1" height="1" fill="#FFF59D"/>
    <rect x="9" y="6" width="1" height="1" fill="#FFF59D"/>
    <rect x="6" y="9" width="1" height="1" fill="#FFF59D"/>
    <rect x="9" y="9" width="1" height="1" fill="#FFF59D"/>
    <!-- Entrance -->
    <rect x="7" y="12" width="2" height="2" fill="#FFD54F"/>
  `, "0 0 16 16", "pixel-building-hotel");

  // Map Tile IDs directly to their Pixel-Art Icon
  const tileIconMap = {
    0: START,
    1: WOOD,
    2: CHANCE,
    3: ANCHOR,
    4: TAX,
    5: DOVE,
    6: JAIL,
    7: TROPHY,
    8: CHEST,
    9: THEATER,
    10: MUSEUM,
    11: ARCHITECT,
    12: FREE_PARKING,
    13: TECH,
    14: CHANCE,
    15: SUN,
    16: TREE,
    17: ECO,
    18: GO_TO_JAIL,
    19: WAVE,
    20: PALM,
    21: CHEST,
    22: DIAMOND,
    23: CROWN
  };

  const typeIconMap = {
    start: START,
    chance: CHANCE,
    chest: CHEST,
    tax: TAX,
    jail: JAIL,
    gotojail: GO_TO_JAIL,
    go_to_jail: GO_TO_JAIL,
    free_parking: FREE_PARKING
  };

  function getTileIcon(tileIndex, tile) {
    if (tileIconMap[tileIndex] !== undefined) {
      return tileIconMap[tileIndex];
    }
    if (tile && tile.type && typeIconMap[tile.type]) {
      return typeIconMap[tile.type];
    }
    return wrap(`<rect x="3" y="3" width="10" height="10" fill="#FFD54F"/>`);
  }

  return {
    START,
    WOOD,
    CHANCE,
    ANCHOR,
    TAX,
    DOVE,
    JAIL,
    TROPHY,
    CHEST,
    THEATER,
    MUSEUM,
    ARCHITECT,
    FREE_PARKING,
    TECH,
    SUN,
    TREE,
    ECO,
    GO_TO_JAIL,
    WAVE,
    PALM,
    DIAMOND,
    CROWN,
    HOUSE,
    HOTEL,
    getTileIcon
  };
})();

// Global registration
window.PixelIcons = PixelIcons;
