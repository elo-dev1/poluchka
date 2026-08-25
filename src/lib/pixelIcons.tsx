import React from 'react';

// Wrapper for crisp pixel-art SVGs
const Wrap: React.FC<{ children: React.ReactNode; viewBox?: string; className?: string }> = ({
  children,
  viewBox = '0 0 16 16',
  className = 'w-full h-full'
}) => (
  <svg
    viewBox={viewBox}
    className={className}
    style={{ shapeRendering: 'crispEdges' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const PixelIcons = {
  // 0. START (Rocket)
  START: () => (
    <Wrap>
      <rect x="7" y="1" width="2" height="2" fill="#FFFFFF" />
      <rect x="6" y="3" width="4" height="2" fill="#E53935" />
      <rect x="5" y="5" width="6" height="4" fill="#FAFAFA" />
      <rect x="7" y="6" width="2" height="2" fill="#03A9F4" />
      <rect x="5" y="9" width="6" height="2" fill="#E53935" />
      <rect x="4" y="8" width="1" height="4" fill="#D32F2F" />
      <rect x="11" y="8" width="1" height="4" fill="#D32F2F" />
      <rect x="3" y="11" width="1" height="2" fill="#B71C1C" />
      <rect x="12" y="11" width="1" height="2" fill="#B71C1C" />
      <rect x="6" y="11" width="4" height="1" fill="#FF9800" />
      <rect x="7" y="12" width="2" height="2" fill="#FFEB3B" />
      <rect x="7" y="14" width="2" height="1" fill="#FF5722" />
    </Wrap>
  ),

  // 1. WOOD
  WOOD: () => (
    <Wrap>
      <rect x="2" y="5" width="12" height="6" fill="#8D6E63" />
      <rect x="4" y="6" width="8" height="4" fill="#A1887F" />
      <rect x="6" y="7" width="4" height="2" fill="#6D4C41" />
      <rect x="2" y="4" width="2" height="1" fill="#5D4037" />
      <rect x="12" y="4" width="2" height="1" fill="#5D4037" />
      <rect x="7" y="1" width="2" height="3" fill="#B0BEC5" />
      <rect x="6" y="2" width="4" height="2" fill="#ECEFF1" />
      <rect x="7" y="4" width="2" height="11" fill="#FFA726" />
      <rect x="8" y="4" width="1" height="11" fill="#FB8C00" />
    </Wrap>
  ),

  // 2, 14. CHANCE
  CHANCE: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#F57C00" />
      <rect x="2" y="2" width="12" height="12" fill="#FFB300" />
      <rect x="3" y="3" width="10" height="10" fill="#FFC107" />
      <rect x="2" y="2" width="1" height="1" fill="#FFE082" />
      <rect x="13" y="2" width="1" height="1" fill="#FFE082" />
      <rect x="2" y="13" width="1" height="1" fill="#FFE082" />
      <rect x="13" y="13" width="1" height="1" fill="#FFE082" />
      <rect x="5" y="4" width="6" height="2" fill="#FFFFFF" />
      <rect x="9" y="5" width="2" height="3" fill="#FFFFFF" />
      <rect x="7" y="7" width="3" height="2" fill="#FFFFFF" />
      <rect x="7" y="9" width="2" height="1" fill="#FFFFFF" />
      <rect x="7" y="11" width="2" height="2" fill="#FFFFFF" />
      <rect x="6" y="5" width="4" height="1" fill="#FFF9C4" />
    </Wrap>
  ),

  // 3. ANCHOR
  ANCHOR: () => (
    <Wrap>
      <rect x="7" y="1" width="2" height="2" fill="#ECEFF1" />
      <rect x="6" y="2" width="4" height="2" fill="#CFD8DC" />
      <rect x="7" y="2" width="2" height="2" fill="#37474F" />
      <rect x="7" y="4" width="2" height="8" fill="#ECEFF1" />
      <rect x="4" y="6" width="8" height="2" fill="#B0BEC5" />
      <rect x="3" y="8" width="2" height="4" fill="#90A4AE" />
      <rect x="11" y="8" width="2" height="4" fill="#90A4AE" />
      <rect x="4" y="11" width="8" height="2" fill="#ECEFF1" />
      <rect x="2" y="8" width="2" height="2" fill="#CFD8DC" />
      <rect x="12" y="8" width="2" height="2" fill="#CFD8DC" />
      <rect x="7" y="13" width="2" height="2" fill="#B0BEC5" />
    </Wrap>
  ),

  // 4. TAX
  TAX: () => (
    <Wrap>
      <rect x="6" y="2" width="4" height="2" fill="#8D6E63" />
      <rect x="5" y="4" width="6" height="2" fill="#D32F2F" />
      <rect x="4" y="6" width="8" height="8" fill="#A1887F" />
      <rect x="3" y="7" width="10" height="6" fill="#8D6E63" />
      <rect x="7" y="7" width="2" height="6" fill="#FFD54F" />
      <rect x="6" y="8" width="4" height="1" fill="#FFD54F" />
      <rect x="6" y="11" width="4" height="1" fill="#FFD54F" />
      <rect x="7" y="0" width="2" height="2" fill="#FFB300" />
    </Wrap>
  ),

  // 5. DOVE
  DOVE: () => (
    <Wrap>
      <rect x="4" y="5" width="8" height="5" fill="#FAFAFA" />
      <rect x="8" y="3" width="4" height="3" fill="#FAFAFA" />
      <rect x="12" y="4" width="2" height="1" fill="#FFA726" />
      <rect x="10" y="4" width="1" height="1" fill="#212121" />
      <rect x="2" y="4" width="4" height="2" fill="#E0E0E0" />
      <rect x="1" y="3" width="3" height="2" fill="#BDBDBD" />
      <rect x="5" y="10" width="2" height="2" fill="#FFA726" />
    </Wrap>
  ),

  // 6. JAIL
  JAIL: () => (
    <Wrap>
      <rect x="2" y="2" width="12" height="12" fill="#263238" />
      <rect x="3" y="3" width="10" height="10" fill="#37474F" />
      <rect x="4" y="2" width="1" height="12" fill="#B0BEC5" />
      <rect x="7" y="2" width="1" height="12" fill="#B0BEC5" />
      <rect x="10" y="2" width="1" height="12" fill="#B0BEC5" />
      <rect x="13" y="2" width="1" height="12" fill="#B0BEC5" />
      <rect x="2" y="5" width="12" height="1" fill="#78909C" />
      <rect x="2" y="10" width="12" height="1" fill="#78909C" />
    </Wrap>
  ),

  // 7. TROPHY
  TROPHY: () => (
    <Wrap>
      <rect x="5" y="2" width="6" height="6" fill="#FFC107" />
      <rect x="4" y="2" width="8" height="2" fill="#FFE082" />
      <rect x="3" y="3" width="2" height="3" fill="#FFA000" />
      <rect x="11" y="3" width="2" height="3" fill="#FFA000" />
      <rect x="6" y="8" width="4" height="2" fill="#FFA000" />
      <rect x="7" y="10" width="2" height="2" fill="#FFC107" />
      <rect x="5" y="12" width="6" height="2" fill="#90A4AE" />
    </Wrap>
  ),

  // 8, 21. CHEST
  CHEST: () => (
    <Wrap>
      <rect x="2" y="4" width="12" height="9" fill="#8D6E63" />
      <rect x="2" y="3" width="12" height="3" fill="#6D4C41" />
      <rect x="1" y="4" width="14" height="2" fill="#FFD54F" />
      <rect x="7" y="6" width="2" height="3" fill="#FFD54F" />
      <rect x="7" y="7" width="2" height="1" fill="#212121" />
      <rect x="2" y="11" width="12" height="2" fill="#4E342E" />
    </Wrap>
  ),

  // 9. THEATER
  THEATER: () => (
    <Wrap>
      <rect x="2" y="3" width="6" height="8" fill="#EC407A" />
      <rect x="8" y="5" width="6" height="8" fill="#AB47BC" />
      <rect x="4" y="5" width="1" height="2" fill="#212121" />
      <rect x="6" y="5" width="1" height="2" fill="#212121" />
      <rect x="4" y="8" width="3" height="1" fill="#212121" />
      <rect x="10" y="7" width="1" height="2" fill="#212121" />
      <rect x="12" y="7" width="1" height="2" fill="#212121" />
      <rect x="10" y="10" width="3" height="1" fill="#212121" />
    </Wrap>
  ),

  // 10. MUSEUM
  MUSEUM: () => (
    <Wrap>
      <polygon points="8,2 2,6 14,6" fill="#ECEFF1" />
      <rect x="2" y="6" width="12" height="1" fill="#CFD8DC" />
      <rect x="3" y="7" width="2" height="5" fill="#ECEFF1" />
      <rect x="6" y="7" width="2" height="5" fill="#ECEFF1" />
      <rect x="8" y="7" width="2" height="5" fill="#ECEFF1" />
      <rect x="11" y="7" width="2" height="5" fill="#ECEFF1" />
      <rect x="2" y="12" width="12" height="2" fill="#90A4AE" />
    </Wrap>
  ),

  // 11. ARCHITECT
  ARCHITECT: () => (
    <Wrap>
      <polygon points="2,13 14,13 8,3" fill="#FFA726" />
      <polygon points="4,11 12,11 8,5" fill="#212121" />
      <rect x="6" y="8" width="4" height="1" fill="#FFA726" />
    </Wrap>
  ),

  // 12. FREE_PARKING
  FREE_PARKING: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#0288D1" />
      <rect x="2" y="2" width="12" height="12" fill="#03A9F4" />
      <rect x="5" y="4" width="3" height="8" fill="#FFFFFF" />
      <rect x="8" y="4" width="3" height="5" fill="#FFFFFF" />
      <rect x="8" y="5" width="1" height="3" fill="#03A9F4" />
    </Wrap>
  ),

  // 13. TECH
  TECH: () => (
    <Wrap>
      <rect x="3" y="3" width="10" height="7" fill="#37474F" />
      <rect x="4" y="4" width="8" height="5" fill="#00E676" />
      <rect x="6" y="5" width="4" height="1" fill="#212121" />
      <rect x="2" y="10" width="12" height="2" fill="#78909C" />
      <rect x="7" y="10" width="2" height="1" fill="#CFD8DC" />
    </Wrap>
  ),

  // 15. SUN
  SUN: () => (
    <Wrap>
      <rect x="5" y="5" width="6" height="6" fill="#FFD54F" />
      <rect x="6" y="6" width="4" height="4" fill="#FFC107" />
      <rect x="7" y="2" width="2" height="2" fill="#FFA000" />
      <rect x="7" y="12" width="2" height="2" fill="#FFA000" />
      <rect x="2" y="7" width="2" height="2" fill="#FFA000" />
      <rect x="12" y="7" width="2" height="2" fill="#FFA000" />
    </Wrap>
  ),

  // 16. TREE
  TREE: () => (
    <Wrap>
      <polygon points="8,2 3,9 13,9" fill="#4CAF50" />
      <polygon points="8,5 4,11 12,11" fill="#388E3C" />
      <rect x="7" y="11" width="2" height="4" fill="#795548" />
    </Wrap>
  ),

  // 17. ECO
  ECO: () => (
    <Wrap>
      <path d="M4,12 C4,6 12,4 12,4 C12,4 14,10 8,12 Z" fill="#66BB6A" />
      <path d="M5,11 C7,8 10,7 10,7" stroke="#2E7D32" strokeWidth="1" fill="none" />
    </Wrap>
  ),

  // 18. GO_TO_JAIL
  GO_TO_JAIL: () => (
    <Wrap>
      <rect x="5" y="2" width="6" height="3" fill="#283593" />
      <rect x="4" y="5" width="8" height="5" fill="#3F51B5" />
      <rect x="7" y="6" width="2" height="2" fill="#FFD54F" />
      <rect x="5" y="10" width="6" height="4" fill="#1A237E" />
    </Wrap>
  ),

  // 19. WAVE
  WAVE: () => (
    <Wrap>
      <rect x="2" y="7" width="4" height="2" fill="#00ACC1" />
      <rect x="6" y="5" width="4" height="2" fill="#00BCD4" />
      <rect x="10" y="7" width="4" height="2" fill="#00ACC1" />
      <rect x="2" y="10" width="12" height="3" fill="#0097A7" />
    </Wrap>
  ),

  // 20. PALM
  PALM: () => (
    <Wrap>
      <path d="M7,14 Q8,8 6,5" stroke="#795548" strokeWidth="2" fill="none" />
      <path d="M6,5 Q2,4 1,6" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
      <path d="M6,5 Q10,3 12,5" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
      <path d="M6,5 Q6,1 7,0" stroke="#81C784" strokeWidth="1.5" fill="none" />
    </Wrap>
  ),

  // 22. DIAMOND
  DIAMOND: () => (
    <Wrap>
      <polygon points="8,2 14,6 8,14 2,6" fill="#00E5FF" />
      <polygon points="8,4 12,6 8,12 4,6" fill="#E0F7FA" />
      <polygon points="8,4 10,6 8,9 6,6" fill="#FFFFFF" />
    </Wrap>
  ),

  // 23. CROWN
  CROWN: () => (
    <Wrap>
      <polygon points="2,12 14,12 14,6 11,9 8,3 5,9 2,6" fill="#FFD54F" />
      <rect x="2" y="12" width="12" height="2" fill="#FFA000" />
      <circle cx="2.5" cy="5.5" r="1" fill="#E91E63" />
      <circle cx="8" cy="2.5" r="1" fill="#2196F3" />
      <circle cx="13.5" cy="5.5" r="1" fill="#4CAF50" />
    </Wrap>
  ),

  // Buildings
  HOUSE: () => (
    <Wrap viewBox="0 0 10 10">
      <polygon points="5,1 1,5 9,5" fill="#2E7D32" />
      <rect x="2" y="5" width="6" height="4" fill="#4CAF50" />
      <rect x="4" y="6" width="2" height="3" fill="#1B5E20" />
    </Wrap>
  ),

  HOTEL: () => (
    <Wrap viewBox="0 0 10 10">
      <polygon points="5,0 0,4 10,4" fill="#B71C1C" />
      <rect x="1" y="4" width="8" height="6" fill="#E53935" />
      <rect x="4" y="6" width="2" height="4" fill="#7F0000" />
      <rect x="2" y="5" width="1" height="1" fill="#FFEB3B" />
      <rect x="7" y="5" width="1" height="1" fill="#FFEB3B" />
    </Wrap>
  ),

  MORTGAGE: () => (
    <div className="bg-red-950/85 text-red-400 border border-red-500 font-extrabold text-[8px] px-1 py-0.5 rounded tracking-tighter shadow-md select-none transform -rotate-6">
      ЗАЛОГ
    </div>
  )
};

export const BRAND_NAME_ICONS: Record<string, string> = {
  'github': '/assets/tiles/github_64px.png',
  'vscode': '/assets/tiles/visual_studio_code_64px.png',
  'vs code': '/assets/tiles/visual_studio_code_64px.png',
  'visual studio code': '/assets/tiles/visual_studio_code_64px.png',
  'citymapper': '/assets/tiles/citymapper_64px.png',
  'telegram': '/assets/tiles/telegram_64px.png',
  'телеграм': '/assets/tiles/telegram_64px.png',
  'discord': '/assets/tiles/discord_64px.png',
  'дискорд': '/assets/tiles/discord_64px.png',
  'zoom': '/assets/tiles/zoom_64px.png',
  'зум': '/assets/tiles/zoom_64px.png',
  'whatsapp': '/assets/tiles/whatsapp_64px.png',
  'ватсап': '/assets/tiles/whatsapp_64px.png',
  'snapchat': '/assets/tiles/snapchat_64px.png',
  'снапчат': '/assets/tiles/snapchat_64px.png',
  'spotify': '/assets/tiles/spotify_64px.png',
  'спотифай': '/assets/tiles/spotify_64px.png',
  'nordvpn': '/assets/tiles/nordvpn_64px.png',
  'winrar': '/assets/tiles/winrar_64px.png',
  'винрар': '/assets/tiles/winrar_64px.png',
  'tiktok': '/assets/tiles/tiktok_64px.png',
  'тикток': '/assets/tiles/tiktok_64px.png',
  'instagram': '/assets/tiles/instagram_64px.png',
  'инстаграм': '/assets/tiles/instagram_64px.png',
  'pinterest': '/assets/tiles/pinterest_64px.png',
  'пинтерест': '/assets/tiles/pinterest_64px.png',
  'airbnb': '/assets/tiles/airbnb_64px.png',
  'doordash': '/assets/tiles/doordash_64px.png',
  'дордаш': '/assets/tiles/doordash_64px.png',
  'youtube': '/assets/tiles/youtube_64px.png',
  'ютуб': '/assets/tiles/youtube_64px.png',
  'netflix': '/assets/tiles/netflix_64px.png',
  'нетфликс': '/assets/tiles/netflix_64px.png',
  'twitch': '/assets/tiles/twitch_64px.png',
  'твич': '/assets/tiles/twitch_64px.png',
  'steam': '/assets/tiles/steam_64px.png',
  'стим': '/assets/tiles/steam_64px.png',
  'playstation': '/assets/tiles/playstation_modern_64px.png',
  'плейстейшн': '/assets/tiles/playstation_modern_64px.png',
  'xbox': '/assets/tiles/xbox_64px.png',
  'иксбокс': '/assets/tiles/xbox_64px.png',
  'booking': '/assets/tiles/booking_com_64px.png',
  'booking.com': '/assets/tiles/booking_com_64px.png',
  'букинг': '/assets/tiles/booking_com_64px.png',
  'amazon': '/assets/tiles/amazon_shopping_64px.png',
  'амазон': '/assets/tiles/amazon_shopping_64px.png',
  'aliexpress': '/assets/tiles/aliexpress_64px.png',
  'алиэкспресс': '/assets/tiles/aliexpress_64px.png',
  'speedtest': '/assets/tiles/speedtest_by_ookla_64px.png',
  'спидтест': '/assets/tiles/speedtest_by_ookla_64px.png',
  'etsy': '/assets/tiles/etsy_64px.png',
  'этси': '/assets/tiles/etsy_64px.png',
  'nike': '/assets/tiles/nike_64px.png',
  'найк': '/assets/tiles/nike_64px.png',
  'adidas': '/assets/tiles/adidas_64px.png',
  'адидас': '/assets/tiles/adidas_64px.png',
  "mcdonald's": '/assets/tiles/mcdonalds_64px.png',
  'mcdonalds': '/assets/tiles/mcdonalds_64px.png',
  'макдоналдс': '/assets/tiles/mcdonalds_64px.png',
  'expedia': '/assets/tiles/expedia_64px.png',
  'экспедия': '/assets/tiles/expedia_64px.png',
  'chatgpt': '/assets/tiles/chatgpt_64px.png',
  'чатгпт': '/assets/tiles/chatgpt_64px.png',
  'claude': '/assets/tiles/claude_64px.png',
  'клод': '/assets/tiles/claude_64px.png',
  'apple': '/assets/tiles/apple_black_64px.png',
  'эппл': '/assets/tiles/apple_black_64px.png',
  'uber': '/assets/tiles/citymapper_64px.png',
  'tesla': '/assets/tiles/speedtest_by_ookla_64px.png',
  'spacex': '/assets/tiles/booking_com_64px.png',
  'boeing': '/assets/tiles/expedia_64px.png',
  'nvidia': '/assets/tiles/nordvpn_64px.png',
  'cloudflare': '/assets/tiles/speedtest_by_ookla_64px.png',
  'vkontakte': '/assets/tiles/instagram_64px.png',
  'yandex': '/assets/tiles/amazon_shopping_64px.png',
  'яндекс': '/assets/tiles/amazon_shopping_64px.png',
  'ozon': '/assets/tiles/amazon_shopping_64px.png',
  'озон': '/assets/tiles/amazon_shopping_64px.png',
  'wildberries': '/assets/tiles/aliexpress_64px.png',
  'вайлдберриз': '/assets/tiles/aliexpress_64px.png',
  'starbucks': '/assets/tiles/mcdonalds_64px.png',
  'старбакс': '/assets/tiles/mcdonalds_64px.png',
};

// Component that renders the real brand PNG icon with pixelated styling and crisp fallback
export const TileIconImage: React.FC<{
  tile: { id?: number; iconUrl?: string; name?: string; type?: string };
  className?: string;
  style?: React.CSSProperties;
}> = ({
  tile,
  className = 'w-6 h-6 sm:w-7 sm:h-7',
  style,
}) => {
  const isSpecialTile = tile.type && tile.type !== 'property';

  if (isSpecialTile) {
    const Fallback = getTileIconComponent(tile);
    return <div className={className} style={style}><Fallback /></div>;
  }

  const nameKey = (tile.name || '').trim().toLowerCase();
  const iconUrl =
    tile.iconUrl ||
    BRAND_NAME_ICONS[nameKey] ||
    (tile.id !== undefined ? BRAND_NAME_ICONS[String(tile.id)] : undefined);

  const [hasError, setHasError] = React.useState(false);

  if (iconUrl && !hasError) {
    return (
      <img
        src={iconUrl}
        alt={tile.name || 'Tile'}
        className={`${className} object-contain`}
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))',
          ...style,
        }}
        onError={() => setHasError(true)}
      />
    );
  }

  const Fallback = getTileIconComponent(tile);
  return <div className={className} style={style}><Fallback /></div>;
};

// Helper function to get the corresponding icon for a tile
export function getTileIconComponent(tile: { id?: number; type?: string; name?: string }) {
  // First match strictly by tile type
  if (tile.type === 'start') return PixelIcons.START;
  if (tile.type === 'chance') return PixelIcons.CHANCE;
  if (tile.type === 'chest') return PixelIcons.CHEST;
  if (tile.type === 'tax') return PixelIcons.TAX;
  if (tile.type === 'jail') return PixelIcons.JAIL;
  if (tile.type === 'go_to_jail') return PixelIcons.GO_TO_JAIL;
  if (tile.type === 'free_parking') return PixelIcons.FREE_PARKING;

  const id = tile.id;
  if (id === 0) return PixelIcons.START;
  if (id === 1) return PixelIcons.WOOD;
  if (id === 2 || id === 7 || id === 14 || id === 22 || id === 36) return PixelIcons.CHANCE;
  if (id === 3) return PixelIcons.ANCHOR;
  if (id === 4 || id === 17 || id === 38) return PixelIcons.TAX;
  if (id === 5) return PixelIcons.DOVE;
  if (id === 6 || id === 10) return PixelIcons.JAIL;
  if (id === 8 || id === 17 || id === 21 || id === 33) return PixelIcons.CHEST;
  if (id === 12 || id === 20) return PixelIcons.FREE_PARKING;
  if (id === 18 || id === 30) return PixelIcons.GO_TO_JAIL;

  return PixelIcons.DIAMOND;
}
