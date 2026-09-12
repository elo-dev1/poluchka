import React from "react";

// Wrapper for crisp pixel-art SVGs
const Wrap: React.FC<{
  children: React.ReactNode;
  viewBox?: string;
  className?: string;
}> = ({ children, viewBox = "0 0 16 16", className = "w-full h-full" }) => (
  <svg
    viewBox={viewBox}
    className={className}
    style={{ shapeRendering: "crispEdges" }}
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
      <path
        d="M5,11 C7,8 10,7 10,7"
        stroke="#2E7D32"
        strokeWidth="1"
        fill="none"
      />
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
      <path
        d="M6,5 Q10,3 12,5"
        stroke="#4CAF50"
        strokeWidth="1.5"
        fill="none"
      />
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
  ),

  // --- ДЕМОНСТРАЦИОННЫЕ КОНЦЕПТЫ ДЛЯ ОЦЕНКИ ---
  // 1. Кодинг & IT: «CodeCat» (пародия на GitHub)
  PARODY_CODECAT: () => (
    <Wrap>
      {/* Ушки с розовой серединкой */}
      <rect x="3" y="2" width="2" height="2" fill="#512DA8" />
      <rect x="4" y="3" width="1" height="1" fill="#FF80AB" />
      <rect x="11" y="2" width="2" height="2" fill="#512DA8" />
      <rect x="11" y="3" width="1" height="1" fill="#FF80AB" />
      {/* Голова кибер-кота */}
      <rect x="4" y="4" width="8" height="6" fill="#311B92" />
      <rect x="3" y="5" width="10" height="4" fill="#311B92" />
      {/* Неоновые светящиеся глазки с бликом */}
      <rect x="5" y="6" width="2" height="2" fill="#00E676" />
      <rect x="9" y="6" width="2" height="2" fill="#00E676" />
      <rect x="6" y="6" width="1" height="1" fill="#FFFFFF" />
      <rect x="10" y="6" width="1" height="1" fill="#FFFFFF" />
      {/* Розовый носик */}
      <rect x="7" y="8" width="2" height="1" fill="#FF4081" />
      {/* Ноутбук / терминал с кодом */}
      <rect x="4" y="10" width="8" height="1" fill="#37474F" />
      <rect x="4" y="11" width="8" height="2" fill="#121212" />
      <rect x="5" y="11" width="2" height="1" fill="#00E676" />
      <rect x="7" y="12" width="4" height="1" fill="#69F0AE" />
      {/* Лапки на клавиатуре */}
      <rect x="3" y="13" width="2" height="1" fill="#7C4DFF" />
      <rect x="5" y="13" width="6" height="1" fill="#424242" />
      <rect x="11" y="13" width="2" height="1" fill="#7C4DFF" />
      <rect x="2" y="14" width="12" height="1" fill="#212121" />
    </Wrap>
  ),

  // --- НАСТОЯЩАЯ 3D-ИЗОМЕТРИЯ В ЧИСТОМ ВЕКТОРНОМ SVG ---
  // 1. Изометрический Фудтрак (Чистый SVG: видна крыша, лобовое, борт, прилавок и колеса в 3D)
  SVG_ISOMETRIC_FOODTRUCK: () => (
    <svg
      viewBox="0 0 36 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Мягкая изометрическая тень на земле */}
      <polygon points="6,27 24,31 32,27 14,23" fill="#000000" opacity="0.25" />

      {/* Верхняя плоскость крыши (Желтая изометрия) */}
      <polygon points="12,3 27,8 19,13 4,8" fill="#FDE047" />
      <polygon points="12,3 27,8 27,9 12,4" fill="#EAB308" />
      {/* Вентиляционный блок на крыше */}
      <polygon
        points="17,5 22,7 20,9 15,7"
        fill="#FEF08A"
        stroke="#CA8A04"
        strokeWidth="0.5"
      />

      {/* Правая грань / Кабина и лобовое стекло (ракурс 3/4) */}
      <polygon points="19,13 27,8 29,13 21,18" fill="#18181B" />
      <polygon points="20,13 26,9 28,12 22,16" fill="#38BDF8" />
      <polygon points="21,13 25,10 26,11 22,14" fill="#E0F2FE" />

      {/* Капот фургона */}
      <polygon points="21,18 29,13 31,16 23,21" fill="#FACC15" />
      {/* Фара передняя (светящаяся) */}
      <polygon points="29,15 31,16 31,18 29,17" fill="#FEF08A" />
      <rect x="29" y="16" width="1" height="1" fill="#FFFFFF" />

      {/* Передний бампер (нижняя голубая часть и бампер) */}
      <polygon points="23,21 31,16 31,21 23,26" fill="#0284C7" />
      <polygon points="23,26 31,21 32,22 24,27" fill="#334155" />

      {/* Левая боковая грань (Стенка с окном выдачи) */}
      {/* Желтый верх стенки */}
      <polygon points="4,8 19,13 19,19 4,14" fill="#EAB308" />

      {/* Полосатый изометрический козырек / тент над окном */}
      <polygon points="7,11 17,14 16,17 6,14" fill="#EF4444" />
      <polygon points="8,11 10,12 9,15 7,14" fill="#FFFFFF" />
      <polygon points="12,12 14,13 13,16 11,15" fill="#FFFFFF" />

      {/* Проем окна выдачи (темный интерьер кухни) */}
      <polygon points="8,14 16,16 16,19 8,17" fill="#090D16" />
      {/* Прилавок и миниатюрный бургер */}
      <polygon points="8,17 16,19 16,20 8,18" fill="#94A3B8" />
      <rect x="11" y="16" width="2" height="1" fill="#F59E0B" />
      <rect x="11" y="15.5" width="2" height="0.5" fill="#EF4444" />

      {/* Нижний голубой борт */}
      <polygon points="4,14 19,19 19,25 4,20" fill="#0284C7" />
      <polygon points="4,14 19,19 19,20 4,15" fill="#38BDF8" />

      {/* Колеса с объемом и дисками */}
      {/* Заднее колесо */}
      <polygon points="6,20 10,21 10,26 6,25" fill="#18181B" />
      <rect x="7" y="21" width="2" height="3" fill="#475569" />
      <rect x="7.5" y="22" width="1" height="1" fill="#CBD5E1" />

      {/* Переднее колесо борта */}
      <polygon points="15,23 19,24 19,29 15,28" fill="#18181B" />
      <rect x="16" y="24" width="2" height="3" fill="#475569" />
      <rect x="16.5" y="25" width="1" height="1" fill="#CBD5E1" />

      {/* Переднее правое колесо */}
      <polygon points="25,24 28,22 28,27 25,29" fill="#18181B" />
      <rect x="25.5" y="24" width="1.5" height="3" fill="#334155" />

      {/* Четкий внешний черный контур всей конструкции */}
      <path
        d="M12,3 L27,8 L29,13 L31,16 L31,21 L32,22 L24,27 L19,25 L4,20 L4,8 Z"
        stroke="#18181B"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  ),

  // 2. Изометрический Кабриолет-Родстер (Чистый SVG с видом сверху на салон и капот)
  SVG_ISOMETRIC_ROADSTER: () => (
    <svg
      viewBox="0 0 36 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Тень */}
      <polygon points="5,24 24,29 32,25 14,20" fill="#000000" opacity="0.25" />

      {/* Задняя часть и антикрыло / спойлер */}
      <polygon
        points="6,9 12,7 15,8 9,10"
        fill="#6B21A8"
        stroke="#18181B"
        strokeWidth="0.8"
      />
      <rect x="8" y="10" width="1" height="2" fill="#18181B" />
      <rect x="13" y="9" width="1" height="2" fill="#18181B" />

      {/* Задние дуги безопасности / подголовники */}
      <polygon points="9,11 13,10 15,12 11,13" fill="#7C3AED" />
      <polygon points="14,12 18,11 20,13 16,14" fill="#7C3AED" />

      {/* Открытый салон (кожаные коричневые кресла и руль - вид сверху 3/4) */}
      <polygon points="10,13 18,10 21,14 13,17" fill="#18181B" />
      <polygon points="11,14 14,12 15,15 12,17" fill="#78350F" />
      <polygon points="15,12 18,11 19,14 16,15" fill="#9A3412" />
      {/* Рулевое колесо */}
      <rect x="18" y="13" width="1" height="2" fill="#CBD5E1" />

      {/* Скошенное лобовое стекло */}
      <polygon points="14,16 22,12 24,14 16,18" fill="#18181B" />
      <polygon points="15,16 21,13 23,14 17,17" fill="#38BDF8" />
      <polygon points="16,16 20,13 21,14 17,17" fill="#E0F2FE" />

      {/* Широкий капот спортивного автомобиля (вид сверху под углом) */}
      <polygon points="16,18 24,14 30,17 22,21" fill="#9333EA" />
      <polygon points="18,18 26,14 27,15 19,19" fill="#C084FC" />
      {/* Фирменные овальные фары на крыльях */}
      <ellipse cx="26" cy="16.5" rx="1.5" ry="1" fill="#E0F2FE" />
      <ellipse cx="23" cy="20" rx="1.5" ry="1" fill="#E0F2FE" />

      {/* Передний аэродинамический бампер и воздухозаборник */}
      <polygon points="22,21 30,17 31,19 23,23" fill="#7C3AED" />
      <polygon points="25,20 29,18 30,19 26,21" fill="#18181B" />

      {/* Левый борт автомобиля */}
      <polygon points="5,13 16,18 16,23 5,18" fill="#6B21A8" />
      <polygon points="6,14 16,18 16,19 6,15" fill="#7C3AED" />

      {/* Колеса спорткара */}
      {/* Заднее колесо */}
      <polygon points="7,17 11,18 11,23 7,22" fill="#18181B" />
      <rect x="8" y="18" width="2" height="3" fill="#475569" />
      <rect x="8.5" y="19" width="1" height="1" fill="#CBD5E1" />

      {/* Переднее колесо борта */}
      <polygon points="17,21 21,22 21,27 17,26" fill="#18181B" />
      <rect x="18" y="22" width="2" height="3" fill="#475569" />
      <rect x="18.5" y="23" width="1" height="1" fill="#CBD5E1" />

      {/* Переднее правое колесо */}
      <polygon points="27,21 30,19 30,24 27,26" fill="#18181B" />
      <rect x="27.5" y="21" width="1.5" height="3" fill="#334155" />

      {/* Внешний контур */}
      <path
        d="M6,9 L12,7 L24,14 L30,17 L31,19 L23,23 L16,23 L5,18 L5,13 Z"
        stroke="#18181B"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  ),

  // --- ПАК ПЕРСОНАЖЕЙ ПО ПРОФЕССИЯМ (ЧИСТЫЙ ВЕКТОРНЫЙ SVG 32x32) ---
  // 1. Программист / IT-разработчик (Худи, очки с бликом, ноутбук с зеленым кодом, кофе)
  CHAR_PROGRAMMER: () => (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="16" cy="30.5" rx="8" ry="1.5" fill="#000000" opacity="0.3" />
      {/* Растрепанные волосы */}
      <rect x="11" y="4" width="10" height="4" fill="#3B1B06" />
      <rect x="9" y="6" width="3" height="3" fill="#3B1B06" />
      <rect x="20" y="6" width="3" height="3" fill="#3B1B06" />
      {/* Наушники на голове */}
      <rect x="9" y="4" width="14" height="1" fill="#0F172A" />
      <rect x="8" y="5" width="2" height="4" fill="#22C55E" />
      <rect x="22" y="5" width="2" height="4" fill="#22C55E" />
      {/* Лицо и очки разработчика с синим бликом монитора */}
      <rect x="11" y="8" width="10" height="6" fill="#FED7AA" />
      <rect x="11" y="9" width="10" height="2" fill="#0F172A" />
      <rect x="12" y="9" width="3" height="2" fill="#0284C7" />
      <rect x="17" y="9" width="3" height="2" fill="#0284C7" />
      <rect x="12" y="9" width="1" height="1" fill="#BAE6FD" />
      <rect x="17" y="9" width="1" height="1" fill="#BAE6FD" />
      {/* Улыбка */}
      <rect x="15" y="12" width="2" height="1" fill="#EA580C" />
      {/* Темный худи с логотипом кода */}
      <rect x="10" y="14" width="12" height="9" fill="#1E293B" />
      <rect x="11" y="14" width="10" height="1" fill="#334155" />
      <rect x="15" y="15" width="2" height="2" fill="#10B981" />{" "}
      {/* Зеленый чип */}
      {/* Руки держат открытый ноутбук */}
      <rect x="8" y="15" width="2" height="4" fill="#1E293B" />
      <rect x="22" y="15" width="2" height="4" fill="#1E293B" />
      <rect x="9" y="19" width="2" height="1" fill="#FED7AA" />
      <rect x="21" y="19" width="2" height="1" fill="#FED7AA" />
      {/* Ноутбук: экран с зеленым кодом >_ */}
      <rect x="11" y="17" width="10" height="5" fill="#020617" />
      <rect x="12" y="18" width="8" height="3" fill="#0F172A" />
      <rect x="13" y="18" width="2" height="1" fill="#00E676" />
      <rect x="13" y="19" width="4" height="1" fill="#00E676" />
      <rect x="10" y="22" width="12" height="1" fill="#475569" />
      {/* Кружка с горячим кофе */}
      <rect x="5" y="19" width="3" height="4" fill="#EF4444" />
      <rect x="4" y="20" width="1" height="2" fill="#EF4444" />
      <rect x="6" y="17" width="1" height="1" fill="#E2E8F0" opacity="0.6" />
      {/* Джинсы и кеды */}
      <rect x="12" y="23" width="3" height="6" fill="#1E40AF" />
      <rect x="17" y="23" width="3" height="6" fill="#1E40AF" />
      <rect x="10" y="29" width="5" height="2" fill="#0284C7" />
      <rect x="17" y="29" width="5" height="2" fill="#0284C7" />
    </svg>
  ),

  // 2. Сварщик / Инженер (Сварочная маска с зеленым светофильтром, брезентовая роба, искры)
  CHAR_WELDER: () => (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="16" cy="30.5" rx="8" ry="1.5" fill="#000000" opacity="0.3" />
      {/* Сварочный защитный шлем */}
      <rect x="10" y="3" width="12" height="12" fill="#1E293B" />
      <rect x="11" y="3" width="10" height="1" fill="#334155" />
      <rect x="9" y="5" width="1" height="8" fill="#0F172A" />
      <rect x="22" y="5" width="1" height="8" fill="#0F172A" />
      {/* Светофильтр сварочной маски с сияющей дугой */}
      <rect x="12" y="7" width="8" height="4" fill="#020617" />
      <rect x="13" y="8" width="6" height="2" fill="#10B981" />
      <rect x="15" y="8" width="2" height="2" fill="#A7F3D0" />
      <rect x="15" y="8" width="1" height="1" fill="#FFFFFF" />
      {/* Брезентовая огнеупорная роба с кожаным фартуком */}
      <rect x="9" y="15" width="14" height="9" fill="#78350F" />
      <rect x="11" y="15" width="10" height="8" fill="#9A3412" />
      <rect x="12" y="16" width="8" height="7" fill="#B45309" />
      {/* Защитные кожаные краги */}
      <rect x="7" y="16" width="3" height="6" fill="#78350F" />
      <rect x="22" y="16" width="3" height="6" fill="#78350F" />
      {/* Сварочный держатель с электродом и яркими искрами */}
      <rect x="6" y="21" width="2" height="2" fill="#475569" />
      <rect x="4" y="22" width="3" height="1" fill="#94A3B8" />
      <rect x="2" y="22" width="2" height="1" fill="#FACC15" />
      {/* Сварочные искры */}
      <rect x="1" y="20" width="1" height="1" fill="#FEF08A" />
      <rect x="2" y="24" width="1" height="1" fill="#FEF08A" />
      <rect x="4" y="24" width="1" height="1" fill="#FFFFFF" />
      <rect x="1" y="22" width="1" height="1" fill="#FFFFFF" />
      {/* Рабочие защитные штаны и ботинки со стальными мысками */}
      <rect x="11" y="24" width="4" height="5" fill="#451A03" />
      <rect x="17" y="24" width="4" height="5" fill="#451A03" />
      <rect x="10" y="29" width="5" height="2" fill="#0F172A" />
      <rect x="17" y="29" width="5" height="2" fill="#0F172A" />
      <rect x="10" y="29" width="2" height="1" fill="#64748B" />
      <rect x="20" y="29" width="2" height="1" fill="#64748B" />
    </svg>
  ),

  // 3. Трейдер / Уолл-Стрит брокер (Белая рубашка, синие подтяжки, красный галстук, график свечей 📈 и пачка денег)
  CHAR_TRADER: () => (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="16" cy="30.5" rx="8" ry="1.5" fill="#000000" opacity="0.3" />
      {/* Прическа «Уолл-Стрит» (зачесанные назад золотисто-русые волосы) */}
      <rect x="11" y="4" width="10" height="4" fill="#B45309" />
      <rect x="12" y="3" width="8" height="1" fill="#D97706" />
      <rect x="10" y="5" width="2" height="4" fill="#92400E" />
      {/* Лицо с азартной уверенной улыбкой */}
      <rect x="11" y="8" width="10" height="6" fill="#FED7AA" />
      <rect x="13" y="10" width="2" height="2" fill="#1E293B" />
      <rect x="14" y="10" width="1" height="1" fill="#FFFFFF" />
      <rect x="17" y="10" width="2" height="2" fill="#1E293B" />
      <rect x="18" y="10" width="1" height="1" fill="#FFFFFF" />
      <rect x="14" y="12" width="4" height="1" fill="#EA580C" />
      {/* Белая рубашка с синими подтяжками и красным галстуком */}
      <rect x="10" y="14" width="12" height="9" fill="#F8FAFC" />
      {/* Синие подтяжки */}
      <rect x="12" y="14" width="1" height="9" fill="#1E40AF" />
      <rect x="19" y="14" width="1" height="9" fill="#1E40AF" />
      {/* Шелковый красный галстук с золотым зажимом */}
      <rect x="15" y="14" width="2" height="7" fill="#DC2626" />
      <rect x="15" y="17" width="2" height="1" fill="#FACC15" />
      {/* Левая рука держит смартфон с зеленым растущим графиком свечей 📈 */}
      <rect x="8" y="15" width="2" height="4" fill="#F8FAFC" />
      <rect x="7" y="19" width="2" height="1" fill="#FED7AA" />
      <rect x="5" y="17" width="4" height="6" fill="#0F172A" />
      <rect x="6" y="18" width="2" height="4" fill="#1E293B" />
      <rect x="6" y="20" width="1" height="2" fill="#22C55E" />{" "}
      {/* Зеленая свеча */}
      <rect x="7" y="19" width="1" height="3" fill="#22C55E" />{" "}
      {/* Растущий тренд */}
      {/* Правая рука держит пачку зеленых долларов 💵 */}
      <rect x="22" y="15" width="2" height="4" fill="#F8FAFC" />
      <rect x="23" y="19" width="2" height="1" fill="#FED7AA" />
      <rect x="23" y="18" width="5" height="3" fill="#15803D" />
      <rect x="24" y="18" width="4" height="3" fill="#22C55E" />
      <rect x="25" y="19" width="2" height="1" fill="#86EFAC" />
      {/* Брюки в полоску и лакированные туфли */}
      <rect x="11" y="23" width="10" height="1" fill="#0F172A" />
      <rect x="12" y="24" width="3" height="5" fill="#1E293B" />
      <rect x="17" y="24" width="3" height="5" fill="#1E293B" />
      <rect x="11" y="29" width="4" height="2" fill="#451A03" />
      <rect x="17" y="29" width="4" height="2" fill="#451A03" />
    </svg>
  ),

  // --- 3D ИЗОМЕТРИЧЕСКИЕ ЗДАНИЯ В ЧИСТОМ ВЕКТОРНОМ SVG ---
  // 1. Аэропорт / Авиатерминал (Стеклянный терминал, диспетчерская вышка с радаром, взлетная полоса и самолет)
  BUILDING_AIRPORT: () => (
    <svg
      viewBox="0 0 36 36"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Летное поле / перрон со световой разметкой */}
      <polygon points="3,27 18,34 33,27 18,21" fill="#0F172A" />
      <polygon points="5,26 18,32 31,26 18,21" fill="#1E293B" />
      <line
        x1="10"
        y1="28"
        x2="22"
        y2="23"
        stroke="#FACC15"
        strokeWidth="1"
        strokeDasharray="2,2"
      />

      {/* Главный терминал аэропорта (изометрический стеклянный блок) */}
      <polygon points="11,14 25,18 19,23 5,18" fill="#F1F5F9" />
      <polygon points="11,14 25,18 25,19 11,15" fill="#CBD5E1" />
      {/* Фасад терминала с панорамным остеклением */}
      <polygon points="5,18 19,23 19,27 5,22" fill="#0284C7" />
      <polygon points="6,19 18,23 18,26 6,22" fill="#38BDF8" />
      <line
        x1="10"
        y1="20"
        x2="10"
        y2="24"
        stroke="#FFFFFF"
        strokeWidth="0.6"
      />
      <line
        x1="14"
        y1="21.5"
        x2="14"
        y2="25.5"
        stroke="#FFFFFF"
        strokeWidth="0.6"
      />
      {/* Боковая часть терминала */}
      <polygon points="19,23 25,18 25,23 19,27" fill="#0369A1" />

      {/* Диспетчерская вышка (КДП) */}
      <polygon points="25,6 29,8 29,20 25,18" fill="#334155" />
      <polygon points="22,8 25,6 25,18 22,20" fill="#475569" />
      {/* Панорамная кабина диспетчеров */}
      <polygon points="21,5 26,3 30,5 25,7" fill="#E2E8F0" />
      <polygon points="21,5 25,7 25,9 21,7" fill="#38BDF8" />
      <polygon points="25,7 30,5 30,7 25,9" fill="#0284C7" />
      {/* Красный сигнальный маяк на вышке */}
      <rect x="25" y="1" width="1" height="2" fill="#94A3B8" />
      <circle cx="25.5" cy="1" r="1.2" fill="#EF4444" />

      {/* Пассажирский лайнер у гейта */}
      <polygon points="8,26 14,24 16,25 10,27" fill="#F8FAFC" />
      <polygon points="11,25 16,21 17,22 12,26" fill="#0284C7" />
      <polygon points="7,27 10,30 11,29 8,26" fill="#0284C7" />
      <polygon points="7,26 8,24 9,24 8,26" fill="#EF4444" />
    </svg>
  ),

  // 2. Больница / Городской медцентр (Клинический белый фасад, светящийся красный крест, вертолетная площадка H, скорая)
  BUILDING_HOSPITAL: () => (
    <svg
      viewBox="0 0 36 36"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Тень здания */}
      <polygon points="4,28 18,34 32,28 18,22" fill="#000000" opacity="0.25" />

      {/* Крыша с вертолетной площадкой санавиации */}
      <polygon points="14,6 28,11 18,17 4,12" fill="#F1F5F9" />
      <polygon points="14,6 28,11 28,12 14,7" fill="#CBD5E1" />
      {/* Круг вертолетной площадки с желтой буквой H */}
      <ellipse
        cx="16"
        cy="11.5"
        rx="5"
        ry="2.5"
        fill="#EF4444"
        opacity="0.15"
      />
      <ellipse
        cx="16"
        cy="11.5"
        rx="4.5"
        ry="2.2"
        fill="none"
        stroke="#FACC15"
        strokeWidth="0.8"
      />
      <rect x="14.8" y="10.5" width="0.7" height="2" fill="#FACC15" />
      <rect x="16.5" y="10.5" width="0.7" height="2" fill="#FACC15" />
      <rect x="14.8" y="11.2" width="2.4" height="0.6" fill="#FACC15" />

      {/* Левый белый фасад */}
      <polygon points="4,12 18,17 18,27 4,22" fill="#F8FAFC" />
      <polygon points="4,12 18,17 18,18 4,13" fill="#E2E8F0" />
      {/* Большой красный медицинский крест */}
      <rect x="7" y="15" width="4" height="1.5" fill="#EF4444" />
      <rect x="8.25" y="13.75" width="1.5" height="4" fill="#EF4444" />
      {/* Окна палат (небесно-голубые) */}
      <rect x="13" y="15" width="2" height="2" fill="#38BDF8" />
      <rect x="13" y="18" width="2" height="2" fill="#38BDF8" />
      <rect x="6" y="19" width="2" height="2" fill="#38BDF8" />
      <rect x="9" y="19" width="2" height="2" fill="#38BDF8" />

      {/* Правый фасад (в тени с рядами окон) */}
      <polygon points="18,17 28,11 28,21 18,27" fill="#CBD5E1" />
      <polygon points="19,16 27,11.5 27,13.5 19,18" fill="#0284C7" />
      <polygon points="19,19 27,14.5 27,16.5 19,21" fill="#0284C7" />

      {/* Зона приема скорой помощи (ER навес) */}
      <polygon points="6,24 12,26 12,27 6,25" fill="#EF4444" />
      <polygon points="7,25 11,26.5 11,29 7,27.5" fill="#0F172A" />

      {/* Машина скорой помощи */}
      <polygon
        points="15,26 21,28 21,31 15,29"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="0.5"
      />
      <rect x="17" y="27" width="2" height="0.8" fill="#EF4444" />
      <rect x="17.5" y="25.5" width="1" height="0.8" fill="#3B82F6" />
    </svg>
  ),

  // 3. Небоскреб / Сити-Тауэр (Зеркальный ступенчатый небоскреб, шпиль с красным маяком, золотые светящиеся окна)
  BUILDING_SKYSCRAPER: () => (
    <svg
      viewBox="0 0 36 36"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Тень небоскреба */}
      <polygon points="2,30 18,35 34,29 18,24" fill="#000000" opacity="0.3" />

      {/* Шпиль антенны с маяком безопасности полетов */}
      <line x1="18" y1="1" x2="18" y2="7" stroke="#94A3B8" strokeWidth="1" />
      <circle cx="18" cy="1" r="1.3" fill="#EF4444" />
      <polygon points="16,7 20,7 19,9 17,9" fill="#64748B" />

      {/* Верхний ярус небоскреба */}
      <polygon points="18,7 23,9 18,11 13,9" fill="#BAE6FD" />
      <polygon points="13,9 18,11 18,17 13,15" fill="#38BDF8" />
      <polygon points="18,11 23,9 23,15 18,17" fill="#0284C7" />

      {/* Средний и нижний ярус (Стеклянная башня) */}
      <polygon points="18,15 25,18 18,21 11,18" fill="#E0F2FE" />
      {/* Левая солнечная грань башни */}
      <polygon points="11,18 18,21 18,31 11,28" fill="#0284C7" />
      {/* Окна офисов корпораций (теплый желтый и белый свет) */}
      <rect x="13" y="19.5" width="1.5" height="1.5" fill="#FEF08A" />
      <rect x="15.5" y="20.5" width="1.5" height="1.5" fill="#FFFFFF" />
      <rect x="13" y="22.5" width="1.5" height="1.5" fill="#FFFFFF" />
      <rect x="15.5" y="23.5" width="1.5" height="1.5" fill="#FEF08A" />
      <rect x="13" y="25.5" width="1.5" height="1.5" fill="#FEF08A" />
      <rect x="15.5" y="26.5" width="1.5" height="1.5" fill="#FFFFFF" />

      {/* Правая грань (зеркальное отражение города) */}
      <polygon points="18,21 25,18 25,28 18,31" fill="#0369A1" />
      <rect
        x="19.5"
        y="20"
        width="1.5"
        height="1.5"
        fill="#FEF08A"
        opacity="0.8"
      />
      <rect x="22" y="19" width="1.5" height="1.5" fill="#7DD3FC" />
      <rect x="19.5" y="23" width="1.5" height="1.5" fill="#7DD3FC" />
      <rect
        x="22"
        y="22"
        width="1.5"
        height="1.5"
        fill="#FEF08A"
        opacity="0.8"
      />
      <rect
        x="19.5"
        y="26"
        width="1.5"
        height="1.5"
        fill="#FEF08A"
        opacity="0.8"
      />
      <rect x="22" y="25" width="1.5" height="1.5" fill="#7DD3FC" />

      {/* Входной портал в небоскреб (Плаза) */}
      <polygon points="11,28 18,31 18,33 11,30" fill="#1E293B" />
      <polygon points="18,31 25,28 25,30 18,33" fill="#0F172A" />
      <rect x="14" y="29.5" width="3" height="2" fill="#FACC15" opacity="0.9" />
    </svg>
  ),

  // 4. Шеф-повар (Высокий поварской колпак, китель, усы, сковорода с пламенем и пицца)
  CHAR_CHEF: () => (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="16" cy="30.5" rx="8" ry="1.5" fill="#000000" opacity="0.3" />
      {/* Высокий белый поварской колпак (Toque Blanche) */}
      <rect x="12" y="1" width="8" height="6" fill="#F8FAFC" />
      <rect x="11" y="2" width="10" height="4" fill="#FFFFFF" />
      <rect x="10" y="7" width="12" height="2" fill="#E2E8F0" />
      {/* Лицо с закрученными итальянскими усами */}
      <rect x="11" y="9" width="10" height="6" fill="#FED7AA" />
      <rect x="13" y="10" width="1" height="2" fill="#18181B" />
      <rect x="18" y="10" width="1" height="2" fill="#18181B" />
      <rect x="11" y="12" width="10" height="1" fill="#18181B" />{" "}
      {/* Пышные усы */}
      <rect x="10" y="11" width="2" height="1" fill="#18181B" />
      <rect x="20" y="11" width="2" height="1" fill="#18181B" />
      {/* Белый двубортный китель с черными пуговицами и красным платком */}
      <rect x="15" y="14" width="2" height="2" fill="#EF4444" />{" "}
      {/* Красный платок */}
      <rect x="10" y="15" width="12" height="9" fill="#FFFFFF" />
      {/* Два ряда черных пуговиц */}
      <rect x="13" y="17" width="1" height="1" fill="#18181B" />
      <rect x="13" y="19" width="1" height="1" fill="#18181B" />
      <rect x="13" y="21" width="1" height="1" fill="#18181B" />
      <rect x="17" y="17" width="1" height="1" fill="#18181B" />
      <rect x="17" y="19" width="1" height="1" fill="#18181B" />
      <rect x="17" y="21" width="1" height="1" fill="#18181B" />
      {/* В левой руке: сковорода с золотым стейком */}
      <rect x="8" y="16" width="2" height="4" fill="#FFFFFF" />
      <rect x="7" y="20" width="2" height="1" fill="#FED7AA" />
      <rect x="3" y="20" width="4" height="2" fill="#475569" />
      <rect x="2" y="19" width="5" height="1" fill="#F59E0B" />
      {/* В правой руке: аппетитный треугольник пиццы с пепперони */}
      <rect x="22" y="16" width="2" height="4" fill="#FFFFFF" />
      <rect x="23" y="20" width="2" height="1" fill="#FED7AA" />
      <polygon points="24,20 28,17 28,23" fill="#FACC15" />
      <rect x="26" y="19" width="1" height="1" fill="#EF4444" />
      {/* Черные поварские брюки и обувь */}
      <rect x="12" y="24" width="3" height="5" fill="#1E293B" />
      <rect x="17" y="24" width="3" height="5" fill="#1E293B" />
      <rect x="11" y="29" width="4" height="2" fill="#0F172A" />
      <rect x="17" y="29" width="4" height="2" fill="#0F172A" />
    </svg>
  ),

  // 5. Нефтяник / Буровик (Оранжевая каска, роба со светоотражателями, разводной ключ)
  CHAR_OILMAN: () => (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="16" cy="30.5" rx="8" ry="1.5" fill="#000000" opacity="0.3" />
      {/* Яркая защитная каска с козырьком */}
      <rect x="11" y="3" width="10" height="4" fill="#F97316" />
      <rect x="12" y="2" width="8" height="1" fill="#FB923C" />
      <rect x="9" y="7" width="14" height="1" fill="#EA580C" />
      {/* Лицо с бородой сибирского буровика */}
      <rect x="11" y="8" width="10" height="6" fill="#FED7AA" />
      <rect x="13" y="9" width="1" height="2" fill="#18181B" />
      <rect x="18" y="9" width="1" height="2" fill="#18181B" />
      {/* Густая борода */}
      <rect x="11" y="11" width="10" height="4" fill="#475569" />
      <rect x="12" y="15" width="8" height="1" fill="#334155" />
      {/* Синий рабочий комбинезон со светоотражающими желтыми полосами */}
      <rect x="10" y="16" width="12" height="8" fill="#1E3A8A" />
      <rect x="10" y="17" width="12" height="1" fill="#FACC15" />{" "}
      {/* Светоотражатель */}
      <rect x="10" y="20" width="12" height="1" fill="#FACC15" />
      {/* Руки в перчатках: держит огромный тяжелый разводной ключ */}
      <rect x="8" y="17" width="2" height="4" fill="#1E3A8A" />
      <rect x="22" y="17" width="2" height="4" fill="#1E3A8A" />
      <rect x="7" y="20" width="3" height="2" fill="#78350F" />
      <rect x="22" y="20" width="3" height="2" fill="#78350F" />
      {/* Разводной трубный ключ (хром) */}
      <rect x="5" y="18" width="2" height="8" fill="#94A3B8" />
      <rect x="4" y="17" width="4" height="2" fill="#CBD5E1" />
      <rect x="4" y="16" width="2" height="2" fill="#64748B" />
      {/* Капля нефти («черное золото») */}
      <rect x="25" y="20" width="2" height="3" fill="#020617" />
      <rect x="25.5" y="19" width="1" height="1" fill="#020617" />
      {/* Тяжелые рабочие сапоги */}
      <rect x="11" y="24" width="4" height="5" fill="#1E3A8A" />
      <rect x="17" y="24" width="4" height="5" fill="#1E3A8A" />
      <rect x="10" y="29" width="5" height="2" fill="#451A03" />
      <rect x="17" y="29" width="5" height="2" fill="#451A03" />
    </svg>
  ),

  // 6. Космонавт / Инженер ЦУП («★ Байконур 1961», гермошлем с золотым забралом, скафандр)
  CHAR_COSMONAUT: () => (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="16" cy="30.5" rx="8" ry="1.5" fill="#000000" opacity="0.3" />
      {/* Круглый белый гермошлем с воротником */}
      <rect x="10" y="3" width="12" height="11" fill="#F8FAFC" />
      <rect x="11" y="2" width="10" height="1" fill="#FFFFFF" />
      <rect x="9" y="5" width="1" height="7" fill="#E2E8F0" />
      <rect x="22" y="5" width="1" height="7" fill="#E2E8F0" />
      {/* Золотое зеркальное забрало шлема с космическим бликом */}
      <rect x="11" y="5" width="10" height="7" fill="#B45309" />
      <rect x="12" y="6" width="8" height="5" fill="#F59E0B" />
      <rect x="13" y="6" width="3" height="3" fill="#FEF08A" />
      <rect x="13" y="6" width="1" height="1" fill="#FFFFFF" />
      {/* Воротниковое кольцо скафандра */}
      <rect x="10" y="14" width="12" height="1" fill="#64748B" />
      {/* Белый скафандр с нагрудной панелью и красной звездой */}
      <rect x="9" y="15" width="14" height="9" fill="#F8FAFC" />
      <rect x="10" y="16" width="12" height="1" fill="#E2E8F0" />
      {/* Нагрудный пульт систем жизнеобеспечения */}
      <rect x="13" y="17" width="6" height="4" fill="#334155" />
      <rect x="14" y="18" width="1" height="1" fill="#EF4444" />
      <rect x="16" y="18" width="1" height="1" fill="#38BDF8" />
      <rect x="18" y="18" width="1" height="1" fill="#22C55E" />
      {/* Рукава с синими гермоманжетами */}
      <rect x="7" y="16" width="2" height="5" fill="#F8FAFC" />
      <rect x="23" y="16" width="2" height="5" fill="#F8FAFC" />
      <rect x="7" y="20" width="2" height="1" fill="#0284C7" />
      <rect x="23" y="20" width="2" height="1" fill="#0284C7" />
      <rect x="6" y="21" width="3" height="3" fill="#E2E8F0" />
      <rect x="23" y="21" width="3" height="3" fill="#E2E8F0" />
      {/* Массивные лунные сапоги скафандра */}
      <rect x="11" y="24" width="4" height="5" fill="#E2E8F0" />
      <rect x="17" y="24" width="4" height="5" fill="#E2E8F0" />
      <rect x="10" y="28" width="5" height="3" fill="#334155" />
      <rect x="17" y="28" width="5" height="3" fill="#334155" />
      <rect x="9" y="30" width="6" height="1" fill="#1E293B" />
      <rect x="17" y="30" width="6" height="1" fill="#1E293B" />
    </svg>
  ),

  // 2. Фиолетовый Спорткар-родстер (Кабриолет премиум-класса)
  ISOMETRIC_ROADSTER: () => (
    <svg
      viewBox="0 0 36 28"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Черный контур аэродинамического кузова */}
      <rect x="7" y="6" width="18" height="1" fill="#18181B" />
      <rect x="5" y="7" width="2" height="1" fill="#18181B" />
      <rect x="4" y="8" width="1" height="10" fill="#18181B" />
      <rect x="25" y="7" width="5" height="1" fill="#18181B" />
      <rect x="30" y="8" width="2" height="6" fill="#18181B" />
      <rect x="31" y="12" width="2" height="5" fill="#18181B" />

      {/* Задние обтекатели / аэродинамические горбы */}
      <rect x="6" y="8" width="6" height="5" fill="#7C3AED" />
      <rect x="8" y="7" width="4" height="2" fill="#9333EA" />
      <rect x="7" y="7" width="2" height="1" fill="#C084FC" />

      {/* Кожаный салон / сиденья (коричневые) */}
      <rect x="13" y="8" width="4" height="5" fill="#78350F" />
      <rect x="14" y="9" width="2" height="3" fill="#9A3412" />

      {/* Лобовое стекло (тонированное, скошенное) */}
      <rect x="17" y="7" width="4" height="7" fill="#18181B" />
      <rect x="18" y="8" width="3" height="5" fill="#38BDF8" />
      <rect x="19" y="8" width="1" height="3" fill="#E0F2FE" />

      {/* Основной фиолетовый кузов родстера */}
      <rect x="5" y="11" width="25" height="6" fill="#7C3AED" />
      <rect x="7" y="12" width="22" height="2" fill="#9333EA" />
      <rect x="11" y="11" width="15" height="1" fill="#A855F7" />
      <rect x="6" y="14" width="24" height="3" fill="#6B21A8" />

      {/* Капот и передние крылья с бликом */}
      <rect x="23" y="10" width="6" height="4" fill="#9333EA" />
      <rect x="24" y="9" width="4" height="1" fill="#C084FC" />
      {/* Передняя овальная фара */}
      <rect x="28" y="12" width="2" height="2" fill="#E0F2FE" />
      <rect x="29" y="12" width="1" height="1" fill="#FFFFFF" />

      {/* Задний диффузор и выхлоп */}
      <rect x="3" y="10" width="2" height="2" fill="#475569" />
      <rect x="3" y="14" width="2" height="2" fill="#475569" />

      {/* Заднее спортивное колесо с диском */}
      <rect x="8" y="14" width="6" height="6" fill="#18181B" />
      <rect x="9" y="15" width="4" height="4" fill="#334155" />
      <rect x="10" y="16" width="2" height="2" fill="#94A3B8" />

      {/* Переднее спортивное колесо с диском */}
      <rect x="23" y="14" width="6" height="6" fill="#18181B" />
      <rect x="24" y="15" width="4" height="4" fill="#334155" />
      <rect x="25" y="16" width="2" height="2" fill="#94A3B8" />

      {/* Тень под машиной */}
      <rect x="5" y="19" width="26" height="1" fill="#020617" opacity="0.4" />
    </svg>
  ),

  // 3. Экспедиционный Внедорожник (Сафари 4x4)
  ISOMETRIC_SUV: () => (
    <svg
      viewBox="0 0 36 28"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Багажник на крыше и ящик с экипировкой */}
      <rect x="8" y="3" width="14" height="1" fill="#18181B" />
      <rect x="9" y="4" width="6" height="3" fill="#78350F" />
      <rect x="10" y="4" width="4" height="1" fill="#9A3412" />
      <rect x="15" y="4" width="6" height="3" fill="#475569" />
      <rect x="7" y="7" width="16" height="1" fill="#18181B" />

      {/* Стойки крыши и тонированные окна */}
      <rect x="6" y="8" width="18" height="6" fill="#18181B" />
      <rect x="7" y="9" width="4" height="4" fill="#38BDF8" />
      <rect x="12" y="9" width="4" height="4" fill="#0284C7" />
      <rect x="17" y="9" width="4" height="4" fill="#0284C7" />
      {/* Лобовое стекло */}
      <rect x="22" y="8" width="3" height="6" fill="#38BDF8" />
      <rect x="23" y="8" width="1" height="4" fill="#E0F2FE" />

      {/* Песочный / бежевый кузов внедорожника */}
      <rect x="6" y="13" width="23" height="6" fill="#D6C7A1" />
      <rect x="7" y="14" width="21" height="1" fill="#EFE5CD" />
      <rect x="6" y="16" width="23" height="3" fill="#BDB08D" />

      {/* Капот джипа */}
      <rect x="24" y="12" width="6" height="3" fill="#D6C7A1" />
      <rect x="24" y="12" width="5" height="1" fill="#EFE5CD" />
      {/* Круглая фара */}
      <rect x="29" y="14" width="2" height="2" fill="#FEF08A" />

      {/* Запасное колесо на багажнике сзади */}
      <rect x="3" y="10" width="3" height="6" fill="#18181B" />
      <rect x="4" y="11" width="2" height="4" fill="#475569" />

      {/* Массивные внедорожные колеса 4x4 */}
      <rect x="8" y="16" width="6" height="6" fill="#18181B" />
      <rect x="9" y="17" width="4" height="4" fill="#334155" />
      <rect x="10" y="18" width="2" height="2" fill="#94A3B8" />

      <rect x="22" y="16" width="6" height="6" fill="#18181B" />
      <rect x="23" y="17" width="4" height="4" fill="#334155" />
      <rect x="24" y="18" width="2" height="2" fill="#94A3B8" />

      {/* Усиленный силовой бампер спереди */}
      <rect x="30" y="15" width="2" height="4" fill="#18181B" />
    </svg>
  ),

  // 4. Логистический грузовик с тентом
  ISOMETRIC_TRUCK: () => (
    <svg
      viewBox="0 0 36 28"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Тент кузова (коричневый брезент с ребрами) */}
      <rect x="5" y="4" width="16" height="12" fill="#78593F" />
      <rect x="5" y="4" width="16" height="1" fill="#18181B" />
      <rect x="5" y="4" width="1" height="12" fill="#18181B" />
      <rect x="20" y="4" width="1" height="12" fill="#18181B" />
      {/* Ребра тента */}
      <rect x="8" y="5" width="1" height="11" fill="#5C4028" />
      <rect x="12" y="5" width="1" height="11" fill="#5C4028" />
      <rect x="16" y="5" width="1" height="11" fill="#5C4028" />
      {/* Борт кузова */}
      <rect x="5" y="15" width="15" height="3" fill="#452C1A" />

      {/* Кабина грузовика */}
      <rect x="21" y="8" width="8" height="10" fill="#6B4226" />
      <rect x="21" y="7" width="6" height="1" fill="#18181B" />
      {/* Лобовое стекло */}
      <rect x="25" y="9" width="3" height="4" fill="#18181B" />
      <rect x="26" y="9" width="2" height="3" fill="#38BDF8" />
      {/* Капот грузовика */}
      <rect x="27" y="13" width="5" height="4" fill="#543118" />
      {/* Фара и решетка радиатора */}
      <rect x="31" y="15" width="1" height="2" fill="#FEF08A" />
      <rect x="32" y="14" width="1" height="4" fill="#18181B" />

      {/* Колеса грузовика */}
      <rect x="9" y="17" width="5" height="5" fill="#18181B" />
      <rect x="10" y="18" width="3" height="3" fill="#475569" />
      <rect x="11" y="19" width="1" height="1" fill="#CBD5E1" />

      <rect x="25" y="17" width="5" height="5" fill="#18181B" />
      <rect x="26" y="18" width="3" height="3" fill="#475569" />
      <rect x="27" y="19" width="1" height="1" fill="#CBD5E1" />
    </svg>
  ),

  // 3. Медиа & Музыка: «SoundWave» (пародия на Spotify)
  PARODY_SOUNDWAVE: () => (
    <Wrap>
      {/* Оголовье наушников */}
      <rect x="5" y="1" width="6" height="1" fill="#16A34A" />
      <rect x="3" y="2" width="2" height="1" fill="#16A34A" />
      <rect x="11" y="2" width="2" height="1" fill="#16A34A" />
      <rect x="2" y="3" width="1" height="4" fill="#15803D" />
      <rect x="13" y="3" width="1" height="4" fill="#15803D" />
      {/* Чаши наушников */}
      <rect x="1" y="7" width="3" height="5" fill="#22C55E" />
      <rect x="2" y="8" width="1" height="3" fill="#86EFAC" />
      <rect x="12" y="7" width="3" height="5" fill="#22C55E" />
      <rect x="13" y="8" width="1" height="3" fill="#86EFAC" />
      {/* Звуковой эквалайзер / волна в центре */}
      <rect x="5" y="8" width="1" height="3" fill="#22C55E" />
      <rect x="6" y="7" width="1" height="5" fill="#4ADE80" />
      <rect x="7" y="9" width="1" height="2" fill="#22C55E" />
      <rect x="8" y="5" width="1" height="8" fill="#86EFAC" />
      <rect x="9" y="7" width="1" height="5" fill="#4ADE80" />
      <rect x="10" y="8" width="1" height="3" fill="#22C55E" />
    </Wrap>
  ),

  // 4. Мировые бренды / Фастфуд: «FastBurger» (пародия на McDonald's)
  PARODY_FASTBURGER: () => (
    <Wrap>
      {/* Верхняя булочка */}
      <rect x="5" y="2" width="6" height="1" fill="#F59E0B" />
      <rect x="3" y="3" width="10" height="2" fill="#F59E0B" />
      <rect x="2" y="5" width="12" height="1" fill="#D97706" />
      {/* Кунжут */}
      <rect x="5" y="3" width="1" height="1" fill="#FEF3C7" />
      <rect x="8" y="3" width="1" height="1" fill="#FEF3C7" />
      <rect x="10" y="4" width="1" height="1" fill="#FEF3C7" />
      {/* Свежий лист салата (зеленый) */}
      <rect x="2" y="6" width="12" height="1" fill="#22C55E" />
      <rect x="3" y="7" width="2" height="1" fill="#16A34A" />
      <rect x="7" y="7" width="2" height="1" fill="#16A34A" />
      <rect x="11" y="7" width="2" height="1" fill="#16A34A" />
      {/* Помидор / кетчуп */}
      <rect x="2" y="7" width="12" height="1" fill="#EF4444" />
      {/* Сыр чеддер (тающий уголок) */}
      <rect x="2" y="8" width="12" height="1" fill="#FBBF24" />
      <rect x="6" y="9" width="2" height="1" fill="#FBBF24" />
      {/* Сочная котлета */}
      <rect x="2" y="9" width="12" height="2" fill="#78350F" />
      <rect x="1" y="10" width="14" height="1" fill="#58240C" />
      {/* Нижняя булочка */}
      <rect x="3" y="11" width="10" height="2" fill="#D97706" />
      <rect x="4" y="13" width="8" height="1" fill="#B45309" />
    </Wrap>
  ),

  // 5. Мессенджеры & Связь: «PaperPlane» (пародия на Telegram)
  PARODY_PAPERPLANE: () => (
    <Wrap>
      {/* Бумажный самолетик в динамичном ракурсе */}
      <polygon points="14,2 2,8 7,10 14,2" fill="#38BDF8" />
      <polygon points="14,2 7,10 8,14 14,2" fill="#0284C7" />
      <polygon points="7,10 8,14 10,11" fill="#0369A1" />
      {/* Блик на верхнем крыле */}
      <polygon points="14,2 6,7 8,8" fill="#BAE6FD" />
      {/* Шлейф ветра / скорости */}
      <rect x="1" y="12" width="3" height="1" fill="#E0F2FE" opacity="0.6" />
      <rect x="3" y="14" width="2" height="1" fill="#E0F2FE" opacity="0.4" />
    </Wrap>
  ),

  // 6. AI & Технологии: «CyberBrain» (пародия на ChatGPT / Claude)
  PARODY_CYBERBRAIN: () => (
    <Wrap>
      {/* Контур кибер-мозга */}
      <rect x="5" y="1" width="6" height="2" fill="#8B5CF6" />
      <rect x="3" y="3" width="10" height="8" fill="#7C3AED" />
      <rect x="2" y="4" width="12" height="6" fill="#6D28D9" />
      {/* Разделение полушарий */}
      <rect x="7" y="2" width="2" height="10" fill="#4C1D95" />
      {/* Неоновые нейроузлы и дорожки процессора */}
      <rect x="4" y="4" width="2" height="1" fill="#22D3EE" />
      <rect x="10" y="4" width="2" height="1" fill="#22D3EE" />
      <rect x="4" y="7" width="2" height="2" fill="#06B6D4" />
      <rect x="10" y="7" width="2" height="2" fill="#06B6D4" />
      {/* Светящееся AI-ядро в центре */}
      <rect x="7" y="5" width="2" height="3" fill="#F43F5E" />
      <rect x="7" y="6" width="2" height="1" fill="#FDA4AF" />
      {/* Нижняя часть ствола мозга / коннектор */}
      <rect x="6" y="11" width="4" height="2" fill="#4C1D95" />
      <rect x="7" y="13" width="2" height="2" fill="#22D3EE" />
    </Wrap>
  ),

  // Концепт 2: Нейтральный деловой / Enterprise («Дата-центр / Серверный стек»)
  ENTERPRISE_DATACENTER: () => (
    <Wrap>
      {/* Серверный шкаф / стойка */}
      <rect x="2" y="1" width="12" height="14" fill="#0F172A" />
      <rect x="3" y="1" width="10" height="1" fill="#334155" />
      <rect x="2" y="1" width="1" height="14" fill="#1E293B" />
      <rect x="13" y="1" width="1" height="14" fill="#1E293B" />
      {/* Юнит 1: Серверный блейд с зеленым и синим индикаторами */}
      <rect x="4" y="3" width="8" height="2" fill="#334155" />
      <rect x="5" y="3" width="3" height="2" fill="#1E293B" />
      <rect x="9" y="3" width="1" height="1" fill="#22C55E" />
      <rect x="11" y="3" width="1" height="1" fill="#38BDF8" />
      {/* Юнит 2: Серверный блейд с янтарным индикатором активности */}
      <rect x="4" y="6" width="8" height="2" fill="#334155" />
      <rect x="5" y="6" width="3" height="2" fill="#1E293B" />
      <rect x="9" y="6" width="1" height="1" fill="#22C55E" />
      <rect x="11" y="6" width="1" height="1" fill="#F59E0B" />
      {/* Юнит 3: Серверный блейд со стабильной индикацией */}
      <rect x="4" y="9" width="8" height="2" fill="#334155" />
      <rect x="5" y="9" width="3" height="2" fill="#1E293B" />
      <rect x="9" y="9" width="1" height="1" fill="#22C55E" />
      <rect x="11" y="9" width="1" height="1" fill="#22C55E" />
      {/* Блок питания / UPS внизу */}
      <rect x="4" y="12" width="8" height="2" fill="#1E293B" />
      <rect x="5" y="13" width="3" height="1" fill="#475569" />
      <rect x="10" y="13" width="1" height="1" fill="#10B981" />
      {/* Опоры шкафа */}
      <rect x="3" y="15" width="2" height="1" fill="#020617" />
      <rect x="11" y="15" width="2" height="1" fill="#020617" />
    </Wrap>
  ),

  // =========================================================================
  // --- ПОЛНЫЙ ПАК КАВЕРНЫХ / ПАРОДИЙНЫХ ИКОНОК КОМПАНИЙ ДЛЯ ВСЕХ 28 ПОЛЕЙ ---
  // =========================================================================

  // 1. GitHub -> «CodeCat» (IT)
  COVER_CODECAT: () => (
    <Wrap>
      <rect x="3" y="2" width="2" height="2" fill="#512DA8" />
      <rect x="4" y="3" width="1" height="1" fill="#FF80AB" />
      <rect x="11" y="2" width="2" height="2" fill="#512DA8" />
      <rect x="11" y="3" width="1" height="1" fill="#FF80AB" />
      <rect x="4" y="4" width="8" height="6" fill="#311B92" />
      <rect x="3" y="5" width="10" height="4" fill="#311B92" />
      <rect x="5" y="6" width="2" height="2" fill="#00E676" />
      <rect x="9" y="6" width="2" height="2" fill="#00E676" />
      <rect x="6" y="6" width="1" height="1" fill="#FFFFFF" />
      <rect x="10" y="6" width="1" height="1" fill="#FFFFFF" />
      <rect x="7" y="8" width="2" height="1" fill="#FF4081" />
      <rect x="4" y="10" width="8" height="1" fill="#37474F" />
      <rect x="4" y="11" width="8" height="2" fill="#121212" />
      <rect x="5" y="11" width="2" height="1" fill="#00E676" />
      <rect x="7" y="12" width="4" height="1" fill="#69F0AE" />
      <rect x="3" y="13" width="2" height="1" fill="#7C4DFF" />
      <rect x="5" y="13" width="6" height="1" fill="#424242" />
      <rect x="11" y="13" width="2" height="1" fill="#7C4DFF" />
      <rect x="2" y="14" width="12" height="1" fill="#212121" />
    </Wrap>
  ),

  // 2. VS Code -> «BlueCode» (IT)
  COVER_BLUECODE: () => (
    <Wrap>
      <rect x="2" y="2" width="12" height="12" fill="#0284C7" />
      <rect x="3" y="3" width="10" height="10" fill="#0369A1" />
      {/* Скобка < */}
      <rect x="4" y="7" width="1" height="2" fill="#38BDF8" />
      <rect x="5" y="6" width="1" height="1" fill="#38BDF8" />
      <rect x="5" y="9" width="1" height="1" fill="#38BDF8" />
      <rect x="6" y="5" width="1" height="1" fill="#38BDF8" />
      <rect x="6" y="10" width="1" height="1" fill="#38BDF8" />
      {/* Точка с запятой ; */}
      <rect x="8" y="6" width="1" height="1" fill="#FEF08A" />
      <rect x="8" y="8" width="1" height="2" fill="#FEF08A" />
      <rect x="7" y="10" width="1" height="1" fill="#FEF08A" />
      {/* Скобка > */}
      <rect x="11" y="7" width="1" height="2" fill="#38BDF8" />
      <rect x="10" y="6" width="1" height="1" fill="#38BDF8" />
      <rect x="10" y="9" width="1" height="1" fill="#38BDF8" />
      <rect x="9" y="5" width="1" height="1" fill="#38BDF8" />
      <rect x="9" y="10" width="1" height="1" fill="#38BDF8" />
    </Wrap>
  ),

  // 3. Uber -> «TurboTaxi» (Транспорт)
  COVER_TURBOTAXI: () => (
    <Wrap>
      {/* Шашечки такси на крыше */}
      <rect x="6" y="3" width="4" height="2" fill="#18181B" />
      <rect x="6" y="3" width="2" height="1" fill="#FACC15" />
      <rect x="8" y="4" width="2" height="1" fill="#FACC15" />
      {/* Кузов желтого такси */}
      <rect x="4" y="5" width="8" height="3" fill="#FACC15" />
      <rect x="5" y="5" width="6" height="2" fill="#FEF08A" />
      <rect x="2" y="8" width="12" height="4" fill="#EAB308" />
      {/* Лобовое стекло */}
      <rect x="5" y="6" width="6" height="2" fill="#38BDF8" />
      {/* Фары */}
      <rect x="2" y="9" width="1" height="2" fill="#FEF08A" />
      <rect x="13" y="9" width="1" height="2" fill="#FEF08A" />
      {/* Бампер с шашечками */}
      <rect x="4" y="11" width="8" height="1" fill="#18181B" />
      <rect x="5" y="11" width="2" height="1" fill="#FFFFFF" />
      <rect x="9" y="11" width="2" height="1" fill="#FFFFFF" />
      {/* Колеса */}
      <rect x="3" y="12" width="3" height="3" fill="#18181B" />
      <rect x="10" y="12" width="3" height="3" fill="#18181B" />
      <rect x="4" y="13" width="1" height="1" fill="#94A3B8" />
      <rect x="11" y="13" width="1" height="1" fill="#94A3B8" />
    </Wrap>
  ),

  // 4. Telegram -> «PaperPlane» (Связь)
  COVER_PAPERPLANE: () => (
    <Wrap>
      <polygon points="14,2 2,8 7,10 14,2" fill="#38BDF8" />
      <polygon points="14,2 7,10 8,14 14,2" fill="#0284C7" />
      <polygon points="7,10 8,14 10,11" fill="#0369A1" />
      <polygon points="14,2 6,7 8,8" fill="#BAE6FD" />
      <rect x="1" y="12" width="3" height="1" fill="#E0F2FE" opacity="0.6" />
      <rect x="3" y="14" width="2" height="1" fill="#E0F2FE" opacity="0.4" />
    </Wrap>
  ),

  // 5. Zoom -> «CamCall» (Связь)
  COVER_CAMCALL: () => (
    <Wrap>
      <rect x="2" y="2" width="12" height="12" fill="#0284C7" />
      <rect x="3" y="3" width="10" height="10" fill="#0369A1" />
      {/* Корпус камеры */}
      <rect x="4" y="5" width="5" height="6" fill="#FFFFFF" />
      <rect x="5" y="6" width="3" height="4" fill="#E0F2FE" />
      {/* Объектив */}
      <polygon points="9,7 12,5 12,11 9,9" fill="#FFFFFF" />
      <polygon points="9,7.5 11,6 11,10 9,8.5" fill="#38BDF8" />
      {/* Красная точка REC */}
      <circle cx="4.5" cy="4.5" r="1" fill="#EF4444" />
    </Wrap>
  ),

  // 6. Snapchat -> «GhostChat» (Связь)
  COVER_GHOSTCHAT: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#FACC15" />
      {/* Голова привидения */}
      <rect x="6" y="3" width="4" height="1" fill="#FFFFFF" />
      <rect x="5" y="4" width="6" height="5" fill="#FFFFFF" />
      <rect x="4" y="6" width="8" height="4" fill="#FFFFFF" />
      {/* Ручки привидения */}
      <rect x="3" y="8" width="2" height="2" fill="#FFFFFF" />
      <rect x="11" y="8" width="2" height="2" fill="#FFFFFF" />
      {/* Глазки */}
      <rect x="6" y="6" width="1" height="2" fill="#18181B" />
      <rect x="9" y="6" width="1" height="2" fill="#18181B" />
      {/* Волнистый низ */}
      <rect x="4" y="11" width="2" height="1" fill="#FFFFFF" />
      <rect x="7" y="11" width="2" height="1" fill="#FFFFFF" />
      <rect x="10" y="11" width="2" height="1" fill="#FFFFFF" />
    </Wrap>
  ),

  // 7. Spotify -> «SoundWave» (Медиа)
  COVER_SOUNDWAVE: () => (
    <Wrap>
      <rect x="5" y="1" width="6" height="1" fill="#16A34A" />
      <rect x="3" y="2" width="2" height="1" fill="#16A34A" />
      <rect x="11" y="2" width="2" height="1" fill="#16A34A" />
      <rect x="2" y="3" width="1" height="4" fill="#15803D" />
      <rect x="13" y="3" width="1" height="4" fill="#15803D" />
      <rect x="1" y="7" width="3" height="5" fill="#22C55E" />
      <rect x="2" y="8" width="1" height="3" fill="#86EFAC" />
      <rect x="12" y="7" width="3" height="5" fill="#22C55E" />
      <rect x="13" y="8" width="1" height="3" fill="#86EFAC" />
      <rect x="5" y="8" width="1" height="3" fill="#22C55E" />
      <rect x="6" y="7" width="1" height="5" fill="#4ADE80" />
      <rect x="7" y="9" width="1" height="2" fill="#22C55E" />
      <rect x="8" y="5" width="1" height="8" fill="#86EFAC" />
      <rect x="9" y="7" width="1" height="5" fill="#4ADE80" />
      <rect x="10" y="8" width="1" height="3" fill="#22C55E" />
    </Wrap>
  ),

  // 8. WinRAR -> «StackBook» (Цифровые сервисы)
  COVER_STACKBOOK: () => (
    <Wrap>
      {/* Книга 1 (Синяя, верхняя) */}
      <rect x="3" y="3" width="10" height="3" fill="#0284C7" />
      <rect x="4" y="3" width="8" height="1" fill="#38BDF8" />
      <rect x="12" y="4" width="1" height="2" fill="#FFFFFF" />
      {/* Книга 2 (Зеленая, средняя) */}
      <rect x="3" y="6" width="10" height="3" fill="#16A34A" />
      <rect x="4" y="6" width="8" height="1" fill="#4ADE80" />
      <rect x="12" y="7" width="1" height="2" fill="#FFFFFF" />
      {/* Книга 3 (Красная, нижняя) */}
      <rect x="3" y="9" width="10" height="3" fill="#DC2626" />
      <rect x="4" y="9" width="8" height="1" fill="#F87171" />
      <rect x="12" y="10" width="1" height="2" fill="#FFFFFF" />
      {/* Кожаный ремень с золотой пряжкой архиватора */}
      <rect x="7" y="2" width="2" height="11" fill="#78350F" />
      <rect x="6" y="7" width="4" height="2" fill="#FACC15" />
      <rect x="7" y="7" width="2" height="2" fill="#18181B" />
    </Wrap>
  ),

  // 9. TikTok -> «BeatNote» (Медиа)
  COVER_BEATNOTE: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#020617" />
      {/* Циановое смещение (слева) */}
      <rect x="6" y="4" width="2" height="6" fill="#00F2FE" />
      <rect x="8" y="3" width="4" height="2" fill="#00F2FE" />
      <rect x="4" y="8" width="4" height="4" fill="#00F2FE" />
      {/* Маджента-смещение (справа) */}
      <rect x="8" y="5" width="2" height="6" fill="#FE0979" />
      <rect x="10" y="4" width="4" height="2" fill="#FE0979" />
      <rect x="6" y="9" width="4" height="4" fill="#FE0979" />
      {/* Белая нота в центре */}
      <rect x="7" y="4" width="2" height="6" fill="#FFFFFF" />
      <rect x="9" y="3" width="3" height="2" fill="#FFFFFF" />
      <rect x="5" y="8" width="4" height="4" fill="#FFFFFF" />
    </Wrap>
  ),

  // 10. Pinterest -> «PinBoard» (Медиа)
  COVER_PINBOARD: () => (
    <Wrap>
      <circle cx="8" cy="8" r="7" fill="#DC2626" />
      {/* Канцелярская кнопка-гвоздик */}
      <rect x="6" y="3" width="4" height="2" fill="#FFFFFF" />
      <rect x="7" y="5" width="2" height="3" fill="#E2E8F0" />
      <polygon points="5,8 11,8 9,11 7,11" fill="#CBD5E1" />
      {/* Острие иглы */}
      <polygon points="8,11 7,14 9,14" fill="#94A3B8" />
      {/* Блик */}
      <rect x="7" y="4" width="1" height="1" fill="#FFFFFF" />
    </Wrap>
  ),

  // 11. Bolt -> «VoltDrive» (Транспорт)
  COVER_VOLTDRIVE: () => (
    <Wrap>
      <circle cx="8" cy="8" r="7" fill="#22C55E" />
      {/* Золотая молния скорости */}
      <polygon points="9,2 5,8 8,8 6,14 12,7 9,7" fill="#FACC15" />
      <polygon points="9,3 6,8 8,8" fill="#FEF08A" />
      <polygon points="7,9 11,7 9,7" fill="#EAB308" />
    </Wrap>
  ),

  // 12. YouTube -> «PlayTube» (Видео)
  COVER_PLAYTUBE: () => (
    <Wrap>
      {/* Красный округлый экран */}
      <rect x="1" y="3" width="14" height="10" rx="3" fill="#EF4444" />
      <rect x="2" y="4" width="12" height="8" fill="#DC2626" />
      {/* Белый треугольник воспроизведения */}
      <polygon points="6,5 11,8 6,11" fill="#FFFFFF" />
    </Wrap>
  ),

  // 13. Netflix -> «RedFlix» (Видео)
  COVER_REDFLIX: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#020617" />
      {/* Красная изометрическая лента 'N' */}
      <rect x="3" y="2" width="3" height="12" fill="#B91C1C" />
      <polygon points="3,2 6,2 13,14 10,14" fill="#EF4444" />
      <rect x="10" y="2" width="3" height="12" fill="#B91C1C" />
      {/* Тень перехлеста ленты */}
      <polygon points="6,7 8,11 6,11" fill="#7F1D1D" />
    </Wrap>
  ),

  // 14. Twitch -> «GlitchStream» (Видео)
  COVER_GLITCHSTREAM: () => (
    <Wrap>
      {/* Фиолетовый бабл стрима */}
      <rect x="2" y="2" width="12" height="10" fill="#9333EA" />
      <rect x="3" y="12" width="3" height="2" fill="#9333EA" />
      <polygon points="6,12 8,12 6,14" fill="#9333EA" />
      {/* Внутреннее белое поле */}
      <rect x="4" y="4" width="8" height="6" fill="#FFFFFF" />
      {/* Робо-глаза стримера */}
      <rect x="5" y="5" width="2" height="3" fill="#9333EA" />
      <rect x="9" y="5" width="2" height="3" fill="#9333EA" />
    </Wrap>
  ),

  // 15. Steam -> «GamePipe» (Игры)
  COVER_GAMEPIPE: () => (
    <Wrap>
      <circle cx="8" cy="8" r="7" fill="#1E293B" />
      {/* Металлический рычаг / коленвал */}
      <circle cx="11" cy="5" r="2.5" fill="#64748B" />
      <circle cx="11" cy="5" r="1.5" fill="#94A3B8" />
      <polygon points="10,6 6,11 8,12 12,7" fill="#475569" />
      {/* Манометр / поршень */}
      <circle cx="6" cy="11" r="3" fill="#334155" />
      <circle cx="6" cy="11" r="2" fill="#F8FAFC" />
      <rect x="6" y="10" width="1" height="1" fill="#EF4444" />
    </Wrap>
  ),

  // 16. PlayStation -> «PadStation» (Игры)
  COVER_PADSTATION: () => (
    <Wrap>
      <rect x="1" y="3" width="14" height="10" rx="3" fill="#1E3A8A" />
      {/* D-Pad крестовина слева */}
      <rect x="3" y="7" width="4" height="2" fill="#FFFFFF" />
      <rect x="4" y="6" width="2" height="4" fill="#FFFFFF" />
      {/* 4 символа кнопок справа */}
      <polygon points="11,5 10,7 12,7" fill="#22C55E" /> {/* Треугольник */}
      <circle cx="12.5" cy="8" r="1" fill="#EF4444" /> {/* Круг */}
      <rect x="10.5" y="9" width="1.5" height="1.5" fill="#38BDF8" />{" "}
      {/* Крестик */}
      <rect x="9" y="8" width="1.5" height="1.5" fill="#EC4899" />{" "}
      {/* Квадрат */}
    </Wrap>
  ),

  // 17. Xbox -> «BoxGame» (Игры)
  COVER_BOXGAME: () => (
    <Wrap>
      <circle cx="8" cy="8" r="7" fill="#15803D" />
      <circle cx="8" cy="8" r="6" fill="#18181B" />
      {/* Неоновый зеленый X-срез */}
      <polygon points="4,4 6,4 12,12 10,12" fill="#22C55E" />
      <polygon points="12,4 10,4 4,12 6,12" fill="#22C55E" />
      <circle cx="8" cy="8" r="1.5" fill="#4ADE80" />
    </Wrap>
  ),

  // 18. Lyft -> «PinkRide» (Транспорт)
  COVER_PINKRIDE: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#EC4899" />
      {/* Белый кабриолет */}
      <rect x="3" y="5" width="10" height="5" fill="#FFFFFF" />
      <rect x="4" y="6" width="8" height="2" fill="#FBCFE8" />
      {/* Розовые усы на бампере */}
      <rect x="4" y="9" width="3" height="1" fill="#BE185D" />
      <rect x="9" y="9" width="3" height="1" fill="#BE185D" />
      <rect x="7" y="8" width="2" height="1" fill="#BE185D" />
      {/* Колеса */}
      <rect x="4" y="10" width="2" height="2" fill="#18181B" />
      <rect x="10" y="10" width="2" height="2" fill="#18181B" />
    </Wrap>
  ),

  // 19. Amazon -> «SmileBox» (Маркетплейсы)
  COVER_SMILEBOX: () => (
    <Wrap>
      {/* Картонная коробка посылки */}
      <rect x="2" y="3" width="12" height="10" fill="#D97706" />
      <rect x="3" y="4" width="10" height="8" fill="#B45309" />
      <rect x="7" y="3" width="2" height="10" fill="#78350F" /> {/* Скотч */}
      {/* Оранжевая стрелка-улыбка */}
      <path
        d="M4,10 Q8,13 12,10"
        stroke="#F59E0B"
        strokeWidth="1.2"
        fill="none"
      />
      <polygon points="12,10 11,8 13,9" fill="#F59E0B" />
    </Wrap>
  ),

  // 20. AliExpress -> «OrangeCart» (Маркетплейсы)
  COVER_ORANGECART: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#EA580C" />
      {/* Белая тележка супермаркета */}
      <rect x="4" y="5" width="8" height="4" fill="#FFFFFF" />
      <rect x="5" y="6" width="2" height="2" fill="#EF4444" /> {/* Посылка 1 */}
      <rect x="8" y="5" width="3" height="3" fill="#FACC15" /> {/* Посылка 2 */}
      <rect x="3" y="4" width="1" height="6" fill="#FFFFFF" />
      <rect x="4" y="9" width="7" height="1" fill="#FFFFFF" />
      {/* Колесики тележки */}
      <circle cx="5.5" cy="11.5" r="1" fill="#18181B" />
      <circle cx="10.5" cy="11.5" r="1" fill="#18181B" />
    </Wrap>
  ),

  // 21. Speedtest -> «SpeedMeter» (Цифровые сервисы)
  COVER_SPEEDMETER: () => (
    <Wrap>
      <circle cx="8" cy="8" r="7" fill="#0F172A" />
      <circle cx="8" cy="8" r="6" fill="#1E293B" />
      {/* Шкала скорости (синий -> желтый -> красный) */}
      <path
        d="M3,10 A5,5 0 0,1 13,10"
        stroke="#38BDF8"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M9,4 A5,5 0 0,1 13,10"
        stroke="#EF4444"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Стрелка спидометра на максимуме */}
      <line x1="8" y1="8" x2="12" y2="6" stroke="#FEF08A" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="1.5" fill="#FFFFFF" />
    </Wrap>
  ),

  // 22. Etsy -> «CraftShop» (Маркетплейсы)
  COVER_CRAFTSHOP: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#C2410C" />
      {/* Клубок шерстяной пряжи */}
      <circle cx="7.5" cy="8.5" r="4.5" fill="#F97316" />
      <circle cx="7.5" cy="8.5" r="3.5" fill="#FB923C" />
      <rect x="5" y="7" width="5" height="1" fill="#FDBA74" />
      <rect x="6" y="9" width="4" height="1" fill="#FDBA74" />
      {/* Вязальные спицы */}
      <line x1="3" y1="3" x2="12" y2="13" stroke="#FEF3C7" strokeWidth="1" />
      <line x1="12" y1="3" x2="3" y2="13" stroke="#FEF3C7" strokeWidth="1" />
    </Wrap>
  ),

  // 23. Nike -> «FastWing» (Бренды)
  COVER_FASTWING: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#090D16" />
      {/* Динамичное крыло-росчерк */}
      <polygon points="2,10 5,12 14,3 10,7 5,11" fill="#FFFFFF" />
      <polygon points="14,3 9,6 6,10 4,11" fill="#E2E8F0" />
    </Wrap>
  ),

  // 24. Adidas -> «ThreeTriangles» (Бренды)
  COVER_THREETRIANGLES: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#0F172A" />
      {/* Три ступенчатые диагональные полосы */}
      <polygon points="3,12 5,12 5,10 3,11" fill="#FFFFFF" />
      <polygon points="6,12 8,12 8,7 6,8.5" fill="#FFFFFF" />
      <polygon points="9,12 11,12 11,4 9,5.5" fill="#FFFFFF" />
    </Wrap>
  ),

  // 25. McDonald's -> «FastBurger» (Бренды)
  COVER_FASTBURGER: () => (
    <Wrap>
      <rect x="5" y="2" width="6" height="1" fill="#F59E0B" />
      <rect x="3" y="3" width="10" height="2" fill="#F59E0B" />
      <rect x="2" y="5" width="12" height="1" fill="#D97706" />
      <rect x="5" y="3" width="1" height="1" fill="#FEF3C7" />
      <rect x="8" y="3" width="1" height="1" fill="#FEF3C7" />
      <rect x="2" y="6" width="12" height="1" fill="#22C55E" />
      <rect x="2" y="7" width="12" height="1" fill="#EF4444" />
      <rect x="2" y="8" width="12" height="1" fill="#FBBF24" />
      <rect x="2" y="9" width="12" height="2" fill="#78350F" />
      <rect x="3" y="11" width="10" height="2" fill="#D97706" />
      <rect x="4" y="13" width="8" height="1" fill="#B45309" />
    </Wrap>
  ),

  // 26. Gett -> «FastCab» (Транспорт)
  COVER_FASTCAB: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#0F172A" />
      {/* Желтый плафон CAB на крыше */}
      <rect x="5" y="3" width="6" height="2" fill="#FACC15" />
      <rect x="6" y="3.5" width="1" height="1" fill="#18181B" />
      <rect x="8" y="3.5" width="1" height="1" fill="#18181B" />
      {/* Черный кэб с желтой полосой шашечек */}
      <rect x="3" y="5" width="10" height="6" fill="#1E293B" />
      <rect x="4" y="6" width="8" height="2" fill="#38BDF8" /> {/* Стекло */}
      <rect x="3" y="9" width="10" height="1" fill="#FACC15" /> {/* Шашечки */}
      <rect x="4" y="9" width="2" height="1" fill="#18181B" />
      <rect x="8" y="9" width="2" height="1" fill="#18181B" />
      {/* Колеса */}
      <rect x="4" y="11" width="2" height="2" fill="#000000" />
      <rect x="10" y="11" width="2" height="2" fill="#000000" />
    </Wrap>
  ),

  // 27. ChatGPT -> «CyberBrain» (AI)
  COVER_CYBERBRAIN: () => (
    <Wrap>
      <rect x="5" y="1" width="6" height="2" fill="#8B5CF6" />
      <rect x="3" y="3" width="10" height="8" fill="#7C3AED" />
      <rect x="2" y="4" width="12" height="6" fill="#6D28D9" />
      <rect x="7" y="2" width="2" height="10" fill="#4C1D95" />
      <rect x="4" y="4" width="2" height="1" fill="#22C55E" />
      <rect x="10" y="4" width="2" height="1" fill="#22C55E" />
      <rect x="4" y="7" width="2" height="2" fill="#10B981" />
      <rect x="10" y="7" width="2" height="2" fill="#10B981" />
      <rect x="7" y="5" width="2" height="3" fill="#34D399" />
      <rect x="7" y="6" width="2" height="1" fill="#A7F3D0" />
      <rect x="6" y="11" width="4" height="2" fill="#4C1D95" />
      <rect x="7" y="13" width="2" height="2" fill="#10B981" />
    </Wrap>
  ),

  // 28. Claude -> «AnthropicSpark» (AI)
  COVER_ANTHROPICSPARK: () => (
    <Wrap>
      <rect x="1" y="1" width="14" height="14" fill="#CC785C" />
      <polygon
        points="8,2 9.5,6.5 14,8 9.5,9.5 8,14 6.5,9.5 2,8 6.5,6.5"
        fill="#FEF3C7"
      />
      <polygon points="8,4 9,7 12,8 9,9 8,12 7,9 4,8 7,7" fill="#F59E0B" />
      <circle cx="8" cy="8" r="1.5" fill="#FFFFFF" />
    </Wrap>
  ),

  // =========================================================================
  // --- АВТОПАРК «ОТ РЖАВОГО КОРЧА ДО ГИПЕРКАРА» (2.5D ИЗОМЕТРИЯ) ---
  // =========================================================================

  // 1. «Ржавый Корч» (Самое дешевое авто — $60, Коричневая группа / Новичок)
  CAR_RUSTY_JALOPY: () => (
    <svg
      viewBox="0 0 36 28"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Тень на асфальте */}
      <polygon points="4,21 28,26 33,22 14,18" fill="#000000" opacity="0.25" />
      {/* Багажник на крыше с привязанным грузом */}
      <rect x="13" y="2" width="7" height="3" fill="#713F12" />
      <rect x="14" y="2" width="5" height="1" fill="#854D0E" />
      <line x1="15" y1="2" x2="15" y2="5" stroke="#FDE047" strokeWidth="0.5" />
      <line x1="18" y1="2" x2="18" y2="5" stroke="#FDE047" strokeWidth="0.5" />
      <rect x="11" y="5" width="11" height="1" fill="#18181B" />{" "}
      {/* Решетка багажника */}
      {/* Ржавая крыша седана */}
      <polygon points="10,6 23,6 26,10 7,10" fill="#92400E" />
      <rect x="14" y="6" width="4" height="2" fill="#78350F" />{" "}
      {/* Ржавое пятно */}
      {/* Пыльные окна */}
      <polygon points="7,10 12,10 11,14 6,13" fill="#475569" />
      <polygon points="13,10 20,10 19,14 12,14" fill="#334155" />
      <polygon points="21,10 26,10 28,14 21,14" fill="#64748B" />
      {/* Ржавый кузов */}
      <polygon points="5,13 28,14 30,17 3,16" fill="#B45309" />
      {/* Разноцветная дверь не в цвет (серая грунтовка) */}
      <rect x="13" y="13" width="7" height="6" fill="#64748B" />
      <rect x="14" y="14" width="5" height="4" fill="#94A3B8" />
      <rect x="18" y="15" width="1" height="1" fill="#18181B" />{" "}
      {/* Ручка двери */}
      {/* Капот с ржавчиной */}
      <polygon points="21,14 28,14 31,18 24,18" fill="#92400E" />
      <rect x="25" y="15" width="3" height="2" fill="#78350F" />
      {/* Фары: одна целая, одна заклеенная скотчем крест-накрест */}
      <rect x="29" y="15" width="2" height="2" fill="#FEF08A" />
      <rect x="30" y="17" width="1" height="1" fill="#EF4444" />
      {/* Ржавые колеса без колпаков */}
      <polygon points="7,17 11,17 11,22 7,21" fill="#18181B" />
      <rect x="8" y="18" width="2" height="3" fill="#78350F" />
      <polygon points="21,18 25,18 25,23 21,22" fill="#18181B" />
      <rect x="22" y="19" width="2" height="3" fill="#78350F" />
      {/* Дымок из выхлопной трубы */}
      <rect x="1" y="17" width="2" height="1" fill="#64748B" />
      <circle cx="0.5" cy="16.5" r="1" fill="#94A3B8" opacity="0.6" />
      {/* Черный контур */}
      <path
        d="M10,6 L23,6 L26,10 L30,14 L31,18 L24,18 L11,17 L3,16 L5,13 Z"
        stroke="#18181B"
        strokeWidth="0.8"
        fill="none"
      />
    </svg>
  ),

  // 2. «Кибер-Гиперкар» (Самый дорогой суперкар — $400, Темно-синяя группа / Чемпион)
  CAR_CYBER_HYPERCAR: () => (
    <svg
      viewBox="0 0 36 28"
      className="w-full h-full"
      style={{ shapeRendering: "crispEdges" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Тень и неоновая подсветка днища */}
      <polygon points="4,21 30,26 34,21 16,17" fill="#00F2FE" opacity="0.3" />
      <polygon points="6,21 28,25 32,21 16,18" fill="#000000" opacity="0.4" />
      {/* Массивное карбоновое гоночное антикрыло (спойлер) */}
      <polygon
        points="4,8 11,6 14,7 7,10"
        fill="#0F172A"
        stroke="#18181B"
        strokeWidth="0.8"
      />
      <rect x="7" y="9" width="1" height="3" fill="#18181B" />
      <rect x="12" y="8" width="1" height="3" fill="#18181B" />
      <polygon points="3,8 5,6 6,8" fill="#9333EA" />{" "}
      {/* Торцевая пластина спойлера */}
      {/* Каплевидная низкая крыша и тонированный фонарь кабины */}
      <polygon points="12,8 21,7 24,11 11,12" fill="#00F2FE" />
      <polygon points="13,9 20,8 23,11 12,12" fill="#090D16" />
      <polygon
        points="17,9 20,8 22,11 18,11"
        fill="#38BDF8"
        opacity="0.7"
      />{" "}
      {/* Блик */}
      {/* Аэродинамический низкий кузов (неоновый циан с фиолетовыми стрелами) */}
      <polygon points="6,12 25,12 32,16 5,16" fill="#00F2FE" />
      <polygon points="10,13 18,12 24,15 14,15" fill="#9333EA" />{" "}
      {/* Фиолетовая полоса */}
      <polygon points="22,13 28,12 31,16 26,16" fill="#06B6D4" />
      {/* Хищный заостренный нос гиперкара и сплиттер */}
      <polygon points="25,13 32,15 34,17 26,17" fill="#00F2FE" />
      <polygon points="27,17 34,17 35,18 28,18" fill="#0F172A" />{" "}
      {/* Карбоновый сплиттер */}
      {/* Хищные диодные матричные фары */}
      <polygon points="29,14 33,15 32,16 28,15" fill="#FFFFFF" />
      <polygon points="26,16 29,16.5 28,17 25,17" fill="#22D3EE" />
      {/* Низкопрофильные колеса с неоновыми спицами */}
      <polygon points="7,15 12,15 12,21 7,20" fill="#18181B" />
      <circle cx="9.5" cy="18" r="2" fill="#06B6D4" />
      <circle cx="9.5" cy="18" r="1" fill="#FFFFFF" />
      <polygon points="23,16 28,16 28,22 23,21" fill="#18181B" />
      <circle cx="25.5" cy="19" r="2" fill="#06B6D4" />
      <circle cx="25.5" cy="19" r="1" fill="#FFFFFF" />
      {/* Агрессивный черный контур */}
      <path
        d="M4,8 L11,6 L21,7 L32,15 L35,18 L28,18 L12,21 L5,16 Z"
        stroke="#18181B"
        strokeWidth="0.8"
        fill="none"
      />
    </svg>
  ),
};

// Таблица соответствия: Имя клетки (на русском/английском) -> Каверный SVG-компонент
export const COVER_PARODY_COMPANIES: Record<string, React.FC> = {
  // IT & Разработка
  github: PixelIcons.COVER_CODECAT,
  гитхаб: PixelIcons.COVER_CODECAT,
  codecat: PixelIcons.COVER_CODECAT,
  vscode: PixelIcons.COVER_BLUECODE,
  "vs code": PixelIcons.COVER_BLUECODE,
  вскод: PixelIcons.COVER_BLUECODE,
  bluecode: PixelIcons.COVER_BLUECODE,

  // Транспортная сеть
  uber: PixelIcons.COVER_TURBOTAXI,
  убер: PixelIcons.COVER_TURBOTAXI,
  turbotaxi: PixelIcons.COVER_TURBOTAXI,
  bolt: PixelIcons.COVER_VOLTDRIVE,
  болт: PixelIcons.COVER_VOLTDRIVE,
  voltdrive: PixelIcons.COVER_VOLTDRIVE,
  lyft: PixelIcons.COVER_PINKRIDE,
  лифт: PixelIcons.COVER_PINKRIDE,
  pinkride: PixelIcons.COVER_PINKRIDE,
  gett: PixelIcons.COVER_FASTCAB,
  гетт: PixelIcons.COVER_FASTCAB,
  fastcab: PixelIcons.COVER_FASTCAB,

  // Связь & Мессенджеры
  telegram: PixelIcons.COVER_PAPERPLANE,
  телеграм: PixelIcons.COVER_PAPERPLANE,
  paperplane: PixelIcons.COVER_PAPERPLANE,
  zoom: PixelIcons.COVER_CAMCALL,
  зум: PixelIcons.COVER_CAMCALL,
  camcall: PixelIcons.COVER_CAMCALL,
  snapchat: PixelIcons.COVER_GHOSTCHAT,
  снапчат: PixelIcons.COVER_GHOSTCHAT,
  ghostchat: PixelIcons.COVER_GHOSTCHAT,

  // Медиа & Музыка
  spotify: PixelIcons.COVER_SOUNDWAVE,
  спотифай: PixelIcons.COVER_SOUNDWAVE,
  soundwave: PixelIcons.COVER_SOUNDWAVE,
  tiktok: PixelIcons.COVER_BEATNOTE,
  тикток: PixelIcons.COVER_BEATNOTE,
  beatnote: PixelIcons.COVER_BEATNOTE,
  pinterest: PixelIcons.COVER_PINBOARD,
  пинтерест: PixelIcons.COVER_PINBOARD,
  pinboard: PixelIcons.COVER_PINBOARD,

  // Цифровые сервисы (Utilities)
  winrar: PixelIcons.COVER_STACKBOOK,
  винрар: PixelIcons.COVER_STACKBOOK,
  stackbook: PixelIcons.COVER_STACKBOOK,
  speedtest: PixelIcons.COVER_SPEEDMETER,
  спидтест: PixelIcons.COVER_SPEEDMETER,
  speedmeter: PixelIcons.COVER_SPEEDMETER,

  // Видео & Стриминг
  youtube: PixelIcons.COVER_PLAYTUBE,
  ютуб: PixelIcons.COVER_PLAYTUBE,
  playtube: PixelIcons.COVER_PLAYTUBE,
  netflix: PixelIcons.COVER_REDFLIX,
  нетфликс: PixelIcons.COVER_REDFLIX,
  redflix: PixelIcons.COVER_REDFLIX,
  twitch: PixelIcons.COVER_GLITCHSTREAM,
  твич: PixelIcons.COVER_GLITCHSTREAM,
  glitchstream: PixelIcons.COVER_GLITCHSTREAM,

  // Игровые платформы
  steam: PixelIcons.COVER_GAMEPIPE,
  стим: PixelIcons.COVER_GAMEPIPE,
  gamepipe: PixelIcons.COVER_GAMEPIPE,
  playstation: PixelIcons.COVER_PADSTATION,
  плейстейшн: PixelIcons.COVER_PADSTATION,
  padstation: PixelIcons.COVER_PADSTATION,
  xbox: PixelIcons.COVER_BOXGAME,
  иксбокс: PixelIcons.COVER_BOXGAME,
  boxgame: PixelIcons.COVER_BOXGAME,

  // E-commerce & Маркетплейсы
  amazon: PixelIcons.COVER_SMILEBOX,
  амазон: PixelIcons.COVER_SMILEBOX,
  smilebox: PixelIcons.COVER_SMILEBOX,
  aliexpress: PixelIcons.COVER_ORANGECART,
  алиэкспресс: PixelIcons.COVER_ORANGECART,
  orangecart: PixelIcons.COVER_ORANGECART,
  etsy: PixelIcons.COVER_CRAFTSHOP,
  этси: PixelIcons.COVER_CRAFTSHOP,
  craftshop: PixelIcons.COVER_CRAFTSHOP,

  // Мировые бренды
  nike: PixelIcons.COVER_FASTWING,
  найк: PixelIcons.COVER_FASTWING,
  fastwing: PixelIcons.COVER_FASTWING,
  adidas: PixelIcons.COVER_THREETRIANGLES,
  адидас: PixelIcons.COVER_THREETRIANGLES,
  threetriangles: PixelIcons.COVER_THREETRIANGLES,
  "mcdonald's": PixelIcons.COVER_FASTBURGER,
  mcdonalds: PixelIcons.COVER_FASTBURGER,
  макдоналдс: PixelIcons.COVER_FASTBURGER,
  fastburger: PixelIcons.COVER_FASTBURGER,

  // AI & Технологии
  chatgpt: PixelIcons.COVER_CYBERBRAIN,
  чатгпт: PixelIcons.COVER_CYBERBRAIN,
  cyberbrain: PixelIcons.COVER_CYBERBRAIN,
  claude: PixelIcons.COVER_ANTHROPICSPARK,
  клод: PixelIcons.COVER_ANTHROPICSPARK,
  anthropicspark: PixelIcons.COVER_ANTHROPICSPARK,
};

export const BRAND_NAME_ICONS: Record<string, string> = {
  // --- 28 АВТОМОБИЛЬНЫХ ПОЛЕЙ (2.5D ИЗОМЕТРИЯ) ---
  "ведро с болтами": "/assets/tiles/car_jalopy.png",
  "красный жужик": "/assets/tiles/car_beetle_red.png",
  маршрутка: "/assets/tiles/car_city_bus.png",
  "картошковоз 4×4": "/assets/tiles/car_pickup_teal.png",
  "картошковоз 4x4": "/assets/tiles/car_pickup_teal.png",
  "шустрый курьер": "/assets/tiles/car_delivery_van.png",
  "капсула скорости": "/assets/tiles/car_beetle_blue.png",
  пузотёрка: "/assets/tiles/car_yellow_hatch.png",
  эвакуатор: "/assets/tiles/car_tow_truck.png",
  "красная зажигалка": "/assets/tiles/car_speedster_red.png",
  "дрифт корч": "/assets/tiles/car_drift_coupe.png",
  "дрифт-пепелац": "/assets/tiles/car_drift_coupe.png",
  "двухэтажный турист": "/assets/tiles/car_doubledecker.png",
  шашечки: "/assets/tiles/car_taxi_cab.png",
  "ночной патруль": "/assets/tiles/car_police.png",
  "карета спасения": "/assets/tiles/car_ambulance.png",
  "гряземес 4×4": "/assets/tiles/car_safari_suv.png",
  "гряземес 4x4": "/assets/tiles/car_safari_suv.png",
  "монстр-болотоход": "/assets/tiles/car_mud_bogger.png",
  "пожиратель бензина": "/assets/tiles/car_muscle_car.png",
  "король трассы": "/assets/tiles/car_semi_truck.png",
  "фиолетовая ракета": "/assets/tiles/car_purple_roadster.png",
  "директорский седан": "/assets/tiles/car_silver_sedan.png",
  "огнеборец 01": "/assets/tiles/car_fire_truck.png",
  "тонированный бумер": "/assets/tiles/car_black_sedan.png",
  "золотой люкс": "/assets/tiles/car_gold_roadster.png",
  "бургер на колёсах": "/assets/tiles/car_foodtruck.png",
  "бургер на колесах": "/assets/tiles/car_foodtruck.png",
  "тяжёлый люкс": "/assets/tiles/car_luxury_suv.png",
  "столичный таксопарк": "/assets/tiles/car_taxi_fleet.png",
  "аристократ трассы": "/assets/tiles/car_grand_tourer.png",
  космолёт: "/assets/tiles/car_cyber_hypercar.png",

  // Legacy vehicle names fallback
  "ржавый корч": "/assets/tiles/car_jalopy.png",
  "старый жук": "/assets/tiles/car_beetle_red.png",
  "городской автобус": "/assets/tiles/car_city_bus.png",
  "фермерский пикап": "/assets/tiles/car_pickup_teal.png",
  "фургон доставки": "/assets/tiles/car_delivery_van.png",
  "голубой компакт": "/assets/tiles/car_beetle_blue.png",
  "желтый хэтчбек": "/assets/tiles/car_yellow_hatch.png",
  "служба эвакуации": "/assets/tiles/car_tow_truck.png",
  "красный спидстер": "/assets/tiles/car_speedster_red.png",
  "синий дрифт-купе": "/assets/tiles/car_drift_coupe.png",
  "двухэтажный бус": "/assets/tiles/car_doubledecker.png",
  "городское такси": "/assets/tiles/car_taxi_cab.png",
  "полицейский крузер": "/assets/tiles/car_police.png",
  реанимация: "/assets/tiles/car_ambulance.png",
  "сафари джип 4×4": "/assets/tiles/car_safari_suv.png",
  "сафари джип 4x4": "/assets/tiles/car_safari_suv.png",
  "трофи-вездеход": "/assets/tiles/car_mud_bogger.png",
  "оранжевый маслкар": "/assets/tiles/car_muscle_car.png",
  "дальнобойный тягач": "/assets/tiles/car_semi_truck.png",
  "фиолетовый родстер": "/assets/tiles/car_purple_roadster.png",
  "серебристый люкс": "/assets/tiles/car_silver_sedan.png",
  "пожарный трак": "/assets/tiles/car_fire_truck.png",
  "черный бумер": "/assets/tiles/car_black_sedan.png",
  "золотой кабриолет": "/assets/tiles/car_gold_roadster.png",
  "шеф-фудтрак": "/assets/tiles/car_foodtruck.png",
  "премиум кроссовер": "/assets/tiles/car_luxury_suv.png",
  "флот таксопарка": "/assets/tiles/car_taxi_fleet.png",
  "гранд-турер люкс": "/assets/tiles/car_grand_tourer.png",
  "кибер-гиперкар": "/assets/tiles/car_cyber_hypercar.png",

  // Legacy & external brands
  github: "/assets/tiles/github_64px.png",
  vscode: "/assets/tiles/visual_studio_code_64px.png",
  "vs code": "/assets/tiles/visual_studio_code_64px.png",
  "visual studio code": "/assets/tiles/visual_studio_code_64px.png",
  citymapper: "/assets/tiles/citymapper_64px.png",
  telegram: "/assets/tiles/telegram_64px.png",
  телеграм: "/assets/tiles/telegram_64px.png",
  discord: "/assets/tiles/discord_64px.png",
  дискорд: "/assets/tiles/discord_64px.png",
  zoom: "/assets/tiles/zoom_64px.png",
  зум: "/assets/tiles/zoom_64px.png",
  whatsapp: "/assets/tiles/whatsapp_64px.png",
  ватсап: "/assets/tiles/whatsapp_64px.png",
  snapchat: "/assets/tiles/snapchat_64px.png",
  снапчат: "/assets/tiles/snapchat_64px.png",
  spotify: "/assets/tiles/spotify_64px.png",
  спотифай: "/assets/tiles/spotify_64px.png",
  nordvpn: "/assets/tiles/nordvpn_64px.png",
  winrar: "/assets/tiles/winrar_64px.png",
  винрар: "/assets/tiles/winrar_64px.png",
  tiktok: "/assets/tiles/tiktok_64px.png",
  тикток: "/assets/tiles/tiktok_64px.png",
  instagram: "/assets/tiles/instagram_64px.png",
  инстаграм: "/assets/tiles/instagram_64px.png",
  pinterest: "/assets/tiles/pinterest_64px.png",
  пинтерест: "/assets/tiles/pinterest_64px.png",
  airbnb: "/assets/tiles/airbnb_64px.png",
  doordash: "/assets/tiles/doordash_64px.png",
  дордаш: "/assets/tiles/doordash_64px.png",
  youtube: "/assets/tiles/youtube_64px.png",
  ютуб: "/assets/tiles/youtube_64px.png",
  netflix: "/assets/tiles/netflix_64px.png",
  нетфликс: "/assets/tiles/netflix_64px.png",
  twitch: "/assets/tiles/twitch_64px.png",
  твич: "/assets/tiles/twitch_64px.png",
  steam: "/assets/tiles/steam_64px.png",
  стим: "/assets/tiles/steam_64px.png",
  playstation: "/assets/tiles/playstation_modern_64px.png",
  плейстейшн: "/assets/tiles/playstation_modern_64px.png",
  xbox: "/assets/tiles/xbox_64px.png",
  иксбокс: "/assets/tiles/xbox_64px.png",
  booking: "/assets/tiles/booking_com_64px.png",
  "booking.com": "/assets/tiles/booking_com_64px.png",
  букинг: "/assets/tiles/booking_com_64px.png",
  amazon: "/assets/tiles/amazon_shopping_64px.png",
  амазон: "/assets/tiles/amazon_shopping_64px.png",
  aliexpress: "/assets/tiles/aliexpress_64px.png",
  алиэкспресс: "/assets/tiles/aliexpress_64px.png",
  speedtest: "/assets/tiles/speedtest_by_ookla_64px.png",
  спидтест: "/assets/tiles/speedtest_by_ookla_64px.png",
  etsy: "/assets/tiles/etsy_64px.png",
  этси: "/assets/tiles/etsy_64px.png",
  nike: "/assets/tiles/nike_64px.png",
  найк: "/assets/tiles/nike_64px.png",
  adidas: "/assets/tiles/adidas_64px.png",
  адидас: "/assets/tiles/adidas_64px.png",
  "mcdonald's": "/assets/tiles/mcdonalds_64px.png",
  mcdonalds: "/assets/tiles/mcdonalds_64px.png",
  макдоналдс: "/assets/tiles/mcdonalds_64px.png",
  expedia: "/assets/tiles/expedia_64px.png",
  экспедия: "/assets/tiles/expedia_64px.png",
  chatgpt: "/assets/tiles/chatgpt_64px.png",
  чатгпт: "/assets/tiles/chatgpt_64px.png",
  claude: "/assets/tiles/claude_64px.png",
  клод: "/assets/tiles/claude_64px.png",
  apple: "/assets/tiles/apple_black_64px.png",
  эппл: "/assets/tiles/apple_black_64px.png",
  uber: "/assets/tiles/uber_64px.png",
  убер: "/assets/tiles/uber_64px.png",
  bolt: "/assets/tiles/bolt_64px.png",
  болт: "/assets/tiles/bolt_64px.png",
  lyft: "/assets/tiles/lyft_64px.png",
  лифт: "/assets/tiles/lyft_64px.png",
  gett: "/assets/tiles/gett_64px.png",
  гетт: "/assets/tiles/gett_64px.png",
  tesla: "/assets/tiles/speedtest_by_ookla_64px.png",
  spacex: "/assets/tiles/booking_com_64px.png",
  boeing: "/assets/tiles/expedia_64px.png",
  nvidia: "/assets/tiles/nordvpn_64px.png",
  cloudflare: "/assets/tiles/speedtest_by_ookla_64px.png",
  vkontakte: "/assets/tiles/instagram_64px.png",
  yandex: "/assets/tiles/amazon_shopping_64px.png",
  яндекс: "/assets/tiles/amazon_shopping_64px.png",
  ozon: "/assets/tiles/amazon_shopping_64px.png",
  озон: "/assets/tiles/amazon_shopping_64px.png",
  wildberries: "/assets/tiles/aliexpress_64px.png",
  вайлдберриз: "/assets/tiles/aliexpress_64px.png",
  starbucks: "/assets/tiles/mcdonalds_64px.png",
  старбакс: "/assets/tiles/mcdonalds_64px.png",

  // Special tiles
  start: "/assets/tiles/special_start.png",
  старт: "/assets/tiles/special_start.png",
  chance: "/assets/tiles/special_chance.png",
  шанс: "/assets/tiles/special_chance.png",
  chest: "/assets/tiles/special_chest.png",
  казна: "/assets/tiles/special_chest.png",
  community_chest: "/assets/tiles/special_chest.png",
  jail: "/assets/tiles/special_jail.png",
  тюрьма: "/assets/tiles/special_jail.png",
  штрафстоянка: "/assets/tiles/special_jail.png",
  police: "/assets/tiles/special_police.png",
  полицейский: "/assets/tiles/special_police.png",
  go_to_jail: "/assets/tiles/special_police.png",
  арест: "/assets/tiles/special_police.png",
  "в тюрьму": "/assets/tiles/special_police.png",
  эвакуация: "/assets/tiles/special_police.png",
  free_parking: "/assets/tiles/special_parking.png",
  parking: "/assets/tiles/special_parking.png",
  парковка: "/assets/tiles/special_parking.png",
  "бесплатная парковка": "/assets/tiles/special_parking.png",
  "пит-стоп": "/assets/tiles/special_parking.png",
  питстоп: "/assets/tiles/special_parking.png",
  tax: "/assets/tiles/special_tax_transport.png",
  налог: "/assets/tiles/special_tax_transport.png",
  "транспортный налог": "/assets/tiles/special_tax_transport.png",
  утильсбор: "/assets/tiles/special_tax_recycle.png",
  "эко-сбор": "/assets/tiles/special_tax_recycle.png",

  // Panel Theme: "Панельная романтика"
  "день получки": "/assets/tiles/panel/start_payday.png",
  "гаражи «лада-98»": "/assets/tiles/panel/garages_lada.png",
  "гаражи лада-98": "/assets/tiles/panel/garages_lada.png",
  "гаражи": "/assets/tiles/panel/garages_lada.png",
  "госуслуги": "/assets/tiles/panel/gosuslugi.png",
  "шиномонтажка 24": "/assets/tiles/panel/tire_service.png",
  "шиномонтажка": "/assets/tiles/panel/tire_service.png",
  "шиномонтаж": "/assets/tiles/panel/tire_service.png",
  "квитанция за отопление": "/assets/tiles/panel/tax_heating.png",
  "маршрутка №33": "/assets/tiles/panel/marshrutka_33.png",
  "маршрутка 33": "/assets/tiles/panel/marshrutka_33.png",
  "чебуречная «дружба»": "/assets/tiles/panel/cheburek_druzhba.png",
  "чебуречная дружба": "/assets/tiles/panel/cheburek_druzhba.png",
  "чебуречная": "/assets/tiles/panel/cheburek_druzhba.png",
  "объявления на столбе": "/assets/tiles/panel/chance_flyers.png",
  "объявление на столбе": "/assets/tiles/panel/chance_flyers.png",
  "столб с объявлениями": "/assets/tiles/panel/chance_flyers.png",
  "шаурма «на углях»": "/assets/tiles/panel/shaurma_grill.png",
  "шаурма на углях": "/assets/tiles/panel/shaurma_grill.png",
  "шаурма": "/assets/tiles/panel/shaurma_grill.png",
  "овощебаза №4": "/assets/tiles/panel/veggie_base.png",
  "овощебаза 4": "/assets/tiles/panel/veggie_base.png",
  "овощебаза": "/assets/tiles/panel/veggie_base.png",
  "кпз ровд": "/assets/tiles/panel/jail_kpz.png",
  "радиорынок": "/assets/tiles/panel/radio_market.png",
  "горводоканал": "/assets/tiles/panel/utility_vodokanal.png",
  "вещевой рынок": "/assets/tiles/panel/clothes_market.png",
  "павильон «мясо-рыба»": "/assets/tiles/panel/meat_fish_stall.png",
  "павильон мясо-рыба": "/assets/tiles/panel/meat_fish_stall.png",
  "мясо-рыба": "/assets/tiles/panel/meat_fish_stall.png",
  "пазик «дачный»": "/assets/tiles/panel/pazik_bus.png",
  "пазик дачный": "/assets/tiles/panel/pazik_bus.png",
  "пазик": "/assets/tiles/panel/pazik_bus.png",
  "хрущёвка-пятиэтажка": "/assets/tiles/panel/khrushchyovka_5fl.png",
  "хрущевка-пятиэтажка": "/assets/tiles/panel/khrushchyovka_5fl.png",
  "хрущевка": "/assets/tiles/panel/khrushchyovka_5fl.png",
  "панельная брежневка": "/assets/tiles/panel/panel_brezhnevka.png",
  "брежневка": "/assets/tiles/panel/panel_brezhnevka.png",
  "девятиэтажка с лифтом": "/assets/tiles/panel/panel_elevator_9fl.png",
  "девятиэтажка": "/assets/tiles/panel/panel_elevator_9fl.png",
  "лавочка у подъезда": "/assets/tiles/panel/bench_cat.png",
  "районный трк «планета»": "/assets/tiles/panel/mall_planeta.png",
  "районный трк планета": "/assets/tiles/panel/mall_planeta.png",
  "сетевой «дискаунтер»": "/assets/tiles/panel/discounter_store.png",
  "сетевой дискаунтер": "/assets/tiles/panel/discounter_store.png",
  "дискаунтер": "/assets/tiles/panel/discounter_store.png",
  "круглосуточный 24/7": "/assets/tiles/panel/store_24h.png",
  "трамвай «витязь»": "/assets/tiles/panel/tram_vityaz.png",
  "трамвай витязь": "/assets/tiles/panel/tram_vityaz.png",
  "жк «человейник»": "/assets/tiles/panel/cheloveynik_tower.png",
  "жк человейник": "/assets/tiles/panel/cheloveynik_tower.png",
  "человейник": "/assets/tiles/panel/cheloveynik_tower.png",
  "жк «комфорт плюс»": "/assets/tiles/panel/comfort_gate.png",
  "жк комфорт плюс": "/assets/tiles/panel/comfort_gate.png",
  "городские электросети": "/assets/tiles/panel/utility_electric.png",
  "электросети": "/assets/tiles/panel/utility_electric.png",
  "бизнес-центр класса «b-»": "/assets/tiles/panel/business_center.png",
  "бизнес-центр класса b-": "/assets/tiles/panel/business_center.png",
  "наряд ппс": "/assets/tiles/panel/police_patrol.png",
  "патруль ппс": "/assets/tiles/panel/police_patrol.png",
  "ппс": "/assets/tiles/panel/police_patrol.png",
  "кофейня спешелти": "/assets/tiles/panel/specialty_coffee.png",
  "кофейня": "/assets/tiles/panel/specialty_coffee.png",
  "крафтовый бар": "/assets/tiles/panel/craft_bar.png",
  "бар": "/assets/tiles/panel/craft_bar.png",
  "лофт на заводе": "/assets/tiles/panel/loft_factory.png",
  "лофт": "/assets/tiles/panel/loft_factory.png",
  "кольцевая электричка": "/assets/tiles/panel/electric_train.png",
  "сталинская высотка": "/assets/tiles/panel/stalinka_tower.png",
  "сталинка": "/assets/tiles/panel/stalinka_tower.png",
  "взнос на капремонт": "/assets/tiles/panel/tax_caprepair.png",
  "дореволюционный особняк": "/assets/tiles/panel/mansion_manor.png",
  "особняк": "/assets/tiles/panel/mansion_manor.png",

  // Office Theme: "Офисный планктон"
  "день зарплаты": "/assets/tiles/office/start_payday.png",
  "строгий вахтёр": "/assets/tiles/office/security_turnstile.png",
  "строгий вахтер": "/assets/tiles/office/security_turnstile.png",
  "вахтёр на проходной": "/assets/tiles/office/security_turnstile.png",
  "вахтер на проходной": "/assets/tiles/office/security_turnstile.png",
  "вахтёр": "/assets/tiles/office/security_turnstile.png",
  "вахтер": "/assets/tiles/office/security_turnstile.png",
  "корпоративная казна": "/assets/tiles/office/chest_bonus.png",
  "стажёр с кофе": "/assets/tiles/office/intern_stack.png",
  "стажер с кофе": "/assets/tiles/office/intern_stack.png",
  "перегруженный стажёр": "/assets/tiles/office/intern_stack.png",
  "перегруженный стажер": "/assets/tiles/office/intern_stack.png",
  "стажёр": "/assets/tiles/office/intern_stack.png",
  "стажер": "/assets/tiles/office/intern_stack.png",
  "штраф за опоздание": "/assets/tiles/office/tax_late.png",
  "шаттл от метро": "/assets/tiles/office/metro_shuttle.png",
  "шаттл": "/assets/tiles/office/metro_shuttle.png",
  "сплетница у кулера": "/assets/tiles/office/cooler_gossip.png",
  "кулер": "/assets/tiles/office/cooler_gossip.png",
  "служебный шанс": "/assets/tiles/office/chance_offer.png",
  "оффер от конкурентов": "/assets/tiles/office/chance_offer.png",
  "оффер": "/assets/tiles/office/chance_offer.png",
  "коллега с рыбой": "/assets/tiles/office/fish_microwave.png",
  "коллега с рыбой в свч": "/assets/tiles/office/fish_microwave.png",
  "рыба в свч": "/assets/tiles/office/fish_microwave.png",
  "секретарша у кофемашины": "/assets/tiles/office/coffee_machine.png",
  "секретарша": "/assets/tiles/office/coffee_machine.png",
  "душный кубикл": "/assets/tiles/office/penalty_cubicle.png",
  "кубикл": "/assets/tiles/office/penalty_cubicle.png",
  "hr-интервью": "/assets/tiles/office/hr_interview.png",
  "hr на стресс-интервью": "/assets/tiles/office/hr_interview.png",
  "hr": "/assets/tiles/office/hr_interview.png",
  "техподдержка": "/assets/tiles/office/it_helpdesk.png",
  "эникейщик техподдержки": "/assets/tiles/office/it_helpdesk.png",
  "эникейщик": "/assets/tiles/office/it_helpdesk.png",
  "бизнес-коуч / тренер": "/assets/tiles/office/business_coach.png",
  "бизнес-коуч": "/assets/tiles/office/business_coach.png",
  "бизнес-тренер": "/assets/tiles/office/business_coach.png",
  "пятничная пицца": "/assets/tiles/office/friday_party.png",
  "пицца": "/assets/tiles/office/friday_party.png",
  "офисный тусовщик": "/assets/tiles/office/friday_party.png",
  "тусовщик": "/assets/tiles/office/friday_party.png",
  "лифт в час пик": "/assets/tiles/office/elevator_crowd.png",
  "сейлз с гонгом": "/assets/tiles/office/sales_gong.png",
  "сейлз с победным гонгом": "/assets/tiles/office/sales_gong.png",
  "сейлз на холодных звонках": "/assets/tiles/office/sales_gong.png",
  "сейлз": "/assets/tiles/office/sales_gong.png",
  "гонг": "/assets/tiles/office/sales_gong.png",
  "стресс-бухгалтер": "/assets/tiles/office/stressed_accountant.png",
  "бухгалтер в отчётный период": "/assets/tiles/office/stressed_accountant.png",
  "бухгалтер в отчетный период": "/assets/tiles/office/stressed_accountant.png",
  "бухгалтер": "/assets/tiles/office/stressed_accountant.png",
  "главбух римма": "/assets/tiles/office/chief_accountant.png",
  "главбух римма васильевна": "/assets/tiles/office/chief_accountant.png",
  "римма васильевна": "/assets/tiles/office/chief_accountant.png",
  "главбух с пряниками": "/assets/tiles/office/chief_accountant.png",
  "главбух": "/assets/tiles/office/chief_accountant.png",
  "выгорание в лаундже": "/assets/tiles/office/lounge_burnout.png",
  "лаундж": "/assets/tiles/office/lounge_burnout.png",
  "дежурный админ": "/assets/tiles/office/devops_alert.png",
  "ночной дежурный админ": "/assets/tiles/office/devops_alert.png",
  "ночной админ": "/assets/tiles/office/devops_alert.png",
  "сисадмин": "/assets/tiles/office/it_helpdesk.png",
  "сис-админ": "/assets/tiles/office/it_helpdesk.png",
  "внезапный аудит": "/assets/tiles/office/chance_offer.png",
  "аудит": "/assets/tiles/office/chance_offer.png",
  "фронтендер и css": "/assets/tiles/office/frontend_css.png",
  "фронтендер и сломанный css": "/assets/tiles/office/frontend_css.png",
  "фронтендер": "/assets/tiles/office/frontend_css.png",
  "it-архитектор": "/assets/tiles/office/tech_architect.png",
  "невозмутимый архитектор": "/assets/tiles/office/tech_architect.png",
  "архитектор": "/assets/tiles/office/tech_architect.png",
  "самокатчик": "/assets/tiles/office/scooter_commuter.png",
  "самокатчик в костюме": "/assets/tiles/office/scooter_commuter.png",
  "продакт с канбаном": "/assets/tiles/office/product_manager.png",
  "продакт с канбан-доской": "/assets/tiles/office/product_manager.png",
  "зумер-продакт со смузи": "/assets/tiles/office/product_manager.png",
  "зумер-продакт": "/assets/tiles/office/product_manager.png",
  "продакт": "/assets/tiles/office/product_manager.png",
  "скрам-мастер с таймером": "/assets/tiles/office/scrum_master.png",
  "нервный scrum-мастер": "/assets/tiles/office/scrum_master.png",
  "scrum-мастер": "/assets/tiles/office/scrum_master.png",
  "скрам-мастер": "/assets/tiles/office/scrum_master.png",
  "завхоз михалыч": "/assets/tiles/office/facilities_manager.png",
  "завхоз": "/assets/tiles/office/facilities_manager.png",
  "тимлид на проде": "/assets/tiles/office/teamlead_fire.png",
  "тимлид, тушащий прод": "/assets/tiles/office/teamlead_fire.png",
  "тимлид тушащий прод": "/assets/tiles/office/teamlead_fire.png",
  "тимлид с огнетушителем": "/assets/tiles/office/teamlead_fire.png",
  "тимлид": "/assets/tiles/office/teamlead_fire.png",
  "на ковёр к сео": "/assets/tiles/office/called_to_ceo.png",
  "на ковер к сео": "/assets/tiles/office/called_to_ceo.png",
  "на ковёр": "/assets/tiles/office/called_to_ceo.png",
  "юрист по nda": "/assets/tiles/office/legal_counsel.png",
  "корпоративный юрист": "/assets/tiles/office/legal_counsel.png",
  "юрист": "/assets/tiles/office/legal_counsel.png",
  "финдир (cfo)": "/assets/tiles/office/cfo_cuts.png",
  "финдир, режущий косты": "/assets/tiles/office/cfo_cuts.png",
  "финдир режущий косты": "/assets/tiles/office/cfo_cuts.png",
  "финансовый директор (cfo)": "/assets/tiles/office/cfo_cuts.png",
  "финансовый директор": "/assets/tiles/office/cfo_cuts.png",
  "финдир": "/assets/tiles/office/cfo_cuts.png",
  "cfo": "/assets/tiles/office/cfo_cuts.png",
  "гендиректор (ceo)": "/assets/tiles/office/executive_ceo.png",
  "генеральный директор (ceo)": "/assets/tiles/office/executive_ceo.png",
  "генеральный директор": "/assets/tiles/office/executive_ceo.png",
  "ceo": "/assets/tiles/office/executive_ceo.png",
  "майбах шефа": "/assets/tiles/office/executive_maybach.png",
  "служебный майбах шефа": "/assets/tiles/office/executive_maybach.png",
  "корпоративный майбах": "/assets/tiles/office/executive_maybach.png",
  "майбах": "/assets/tiles/office/executive_maybach.png",
  "анонимный опрос enps": "/assets/tiles/office/chance_offer.png",
  "enps": "/assets/tiles/office/chance_offer.png",
  "совет директоров": "/assets/tiles/office/board_chairman.png",
  "председатель совета директоров": "/assets/tiles/office/board_chairman.png",
  "председатель совета": "/assets/tiles/office/board_chairman.png",
  "сбор на др": "/assets/tiles/office/tax_birthday.png",
  "сбор на др коллеги": "/assets/tiles/office/tax_birthday.png",
  "бенефициар в офшоре": "/assets/tiles/office/offshore_beneficiary.png",
  "бенефициар": "/assets/tiles/office/offshore_beneficiary.png",
};

// Component that renders the real brand / special tile PNG icon with pixelated styling, parody SVG support and crisp fallback
export const TileIconImage: React.FC<{
  tile: { id?: number; iconUrl?: string; name?: string; type?: string };
  className?: string;
  style?: React.CSSProperties;
  useParody?: boolean;
}> = ({
  tile,
  className = "w-6 h-6 sm:w-7 sm:h-7",
  style,
  useParody = false,
}) => {
  const typeKey = (tile.type || "").trim().toLowerCase();
  const nameKey = (tile.name || "").trim().toLowerCase();

  // Проверяем наличие авторской каверной SVG-иконки
  const ParodyComp =
    COVER_PARODY_COMPANIES[nameKey] || COVER_PARODY_COMPANIES[typeKey];

  if (useParody && ParodyComp) {
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={style}
      >
        <ParodyComp />
      </div>
    );
  }

  const iconUrl =
    tile.iconUrl ||
    BRAND_NAME_ICONS[nameKey] ||
    BRAND_NAME_ICONS[typeKey] ||
    (tile.id !== undefined ? BRAND_NAME_ICONS[String(tile.id)] : undefined);

  const [hasError, setHasError] = React.useState(false);

  if (iconUrl && !hasError) {
    return (
      <img
        src={iconUrl}
        alt={tile.name || "Tile"}
        className={`${className} object-contain`}
        style={{
          imageRendering: "pixelated",
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))",
          ...style,
        }}
        onError={() => setHasError(true)}
      />
    );
  }

  // Если иконка не загрузилась или отсутствует — показываем наш каверный векторный SVG
  if (ParodyComp) {
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={style}
      >
        <ParodyComp />
      </div>
    );
  }

  const Fallback = getTileIconComponent(tile);
  return (
    <div className={className} style={style}>
      <Fallback />
    </div>
  );
};

// Helper function to get the corresponding icon for a tile
export function getTileIconComponent(tile: {
  id?: number;
  type?: string;
  name?: string;
}) {
  // First match strictly by tile type
  if (tile.type === "start") return PixelIcons.START;
  if (tile.type === "chance") return PixelIcons.CHANCE;
  if (tile.type === "chest") return PixelIcons.CHEST;
  if (tile.type === "tax") return PixelIcons.TAX;
  if (tile.type === "jail") return PixelIcons.JAIL;
  if (tile.type === "go_to_jail") return PixelIcons.GO_TO_JAIL;
  if (tile.type === "free_parking") return PixelIcons.FREE_PARKING;

  const id = tile.id;
  if (id === 0) return PixelIcons.START;
  if (id === 1) return PixelIcons.WOOD;
  if (id === 2 || id === 7 || id === 14 || id === 22 || id === 36)
    return PixelIcons.CHANCE;
  if (id === 3) return PixelIcons.ANCHOR;
  if (id === 4 || id === 17 || id === 38) return PixelIcons.TAX;
  if (id === 5) return PixelIcons.DOVE;
  if (id === 6 || id === 10) return PixelIcons.JAIL;
  if (id === 8 || id === 17 || id === 21 || id === 33) return PixelIcons.CHEST;
  if (id === 12 || id === 20) return PixelIcons.FREE_PARKING;
  if (id === 18 || id === 30) return PixelIcons.GO_TO_JAIL;

  return PixelIcons.DIAMOND;
}
