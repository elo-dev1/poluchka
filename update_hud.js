const fs = require('fs');
const path = require('path');

function updateTopBar() {
  const p = '/Users/frolov/Desktop/monopoly/src/components/hud/TopBar.tsx';
  let code = fs.readFileSync(p, 'utf8');

  if (!code.includes('const isNoir = theme === \'noir\';')) {
    code = code.replace(/const isSoviet = theme === 'soviet';/, "const isSoviet = theme === 'soviet';\n  const isNoir = theme === 'noir';");
  }

  code = code.replace(
    /isSoviet \? "bg-\[#0c1420\] border-\[#38bdf8\] font-soviet" : "bg-\[#081d14\] border-emerald-500\/40 font-sans"/,
    'isNoir ? "bg-[#1a1410] border-[#d4a647] font-noir-title" : isSoviet ? "bg-[#0c1420] border-[#38bdf8] font-soviet" : "bg-[#081d14] border-emerald-500/40 font-sans"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#dc2626\] drop-shadow-\[0_0_8px_rgba\(220,38,38,0\.8\)\]" : "text-amber-400 drop-shadow-sm"/,
    'isNoir ? "text-[#d4a647] drop-shadow-sm" : isSoviet ? "text-[#dc2626] drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "text-amber-400 drop-shadow-sm"'
  );
  code = code.replace(
    /\{isSoviet \? '★' : '🎲'\}/g,
    "{isNoir ? '🔍' : isSoviet ? '★' : '🎲'}"
  );
  code = code.replace(
    /isSoviet \? "text-\[#e2e8f0\]" : "text-white"/g,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#e2e8f0]" : "text-white"'
  );
  code = code.replace(
    /\{isSoviet \? 'ЦУП БАЙКОНУР 1961' : 'МОНОПОЛИЯ ОНЛАЙН'\}/,
    "{isNoir ? 'FILM NOIR — ЧАСТНЫЙ СЫСК' : isSoviet ? 'ЦУП БАЙКОНУР 1961' : 'МОНОПОЛИЯ ОНЛАЙН'}"
  );
  code = code.replace(
    /isSoviet \? "font-space text-\[#38bdf8\]" : "text-emerald-400 font-medium"/,
    'isNoir ? "font-noir-body text-[#b8a890]" : isSoviet ? "font-space text-[#38bdf8]" : "text-emerald-400 font-medium"'
  );
  code = code.replace(
    /\{isSoviet \? 'КОСМИЧЕСКАЯ ПРОГРАММА СССР • ОКБ-1' : 'КЛАССИЧЕСКАЯ НАСТОЛЬНАЯ ИГРА'\}/,
    "{isNoir ? 'УГОЛОВНОЕ ДЕЛО №1947 • ЛОС-АНДЖЕЛЕС' : isSoviet ? 'КОСМИЧЕСКАЯ ПРОГРАММА СССР • ОКБ-1' : 'КЛАССИЧЕСКАЯ НАСТОЛЬНАЯ ИГРА'}"
  );
  code = code.replace(
    /isSoviet \? "font-space bg-\[#0f172a\] border-\[#38bdf8\] text-\[#38bdf8\] hover:bg-\[#1e293b\]" : "font-sans bg-\[#062016\] border-emerald-500\/60 text-emerald-300 hover:bg-\[#0d3324\]"/,
    'isNoir ? "font-noir-body bg-[#1a1410] border-[#d4a647] text-[#d4a647] hover:bg-[#2a2420]" : isSoviet ? "font-space bg-[#0f172a] border-[#38bdf8] text-[#38bdf8] hover:bg-[#1e293b]" : "font-sans bg-[#062016] border-emerald-500/60 text-emerald-300 hover:bg-[#0d3324]"'
  );
  code = code.replace(
    /\{isSoviet \? `\[ СЕКТОР ЦУП № \$\{roomId\} \]` : `\[ СТОЛ № \$\{roomId\} \]`\}/,
    "{isNoir ? `[ ДЕЛО № ${roomId} ]` : isSoviet ? `[ СЕКТОР ЦУП № ${roomId} ]` : `[ СТОЛ № ${roomId} ]`}"
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f172a\] border-\[#38bdf8\] text-\[#38bdf8\]" : "bg-\[#062016\] border-emerald-500\/50 text-emerald-300"/,
    'isNoir ? "bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8] text-[#38bdf8]" : "bg-[#062016] border-emerald-500/50 text-emerald-300"'
  );
  code = code.replace(
    /\{isSoviet \? `ВИТОК #\$\{gameState\.roundNumber \|\| gameState\.turnNumber \|\| 1\}` : `РАУНД #\$\{gameState\.roundNumber \|\| gameState\.turnNumber \|\| 1\}`\}/,
    "{isNoir ? `ГЛАВА #${gameState.roundNumber || gameState.turnNumber || 1}` : isSoviet ? `ВИТОК #${gameState.roundNumber || gameState.turnNumber || 1}` : `РАУНД #${gameState.roundNumber || gameState.turnNumber || 1}`}"
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f172a\] border-\[#38bdf8\] hover:bg-\[#1e293b\]" : "bg-\[#062016\] border-emerald-500\/50 hover:bg-\[#0d3324\]"/,
    'isNoir ? "bg-[#1a1410] border-[#d4a647] hover:bg-[#2a2420]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8] hover:bg-[#1e293b]" : "bg-[#062016] border-emerald-500/50 hover:bg-[#0d3324]"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#38bdf8\]" : "text-emerald-400"/g,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-emerald-400"'
  );
  code = code.replace(
    /isSoviet \? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans"/,
    'isNoir ? "noir-btn-amber font-noir-title" : isSoviet ? "soviet-btn-cyan font-soviet" : "classic-btn-primary font-sans"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f172a\] border-\[#38bdf8\]\/60 hover:border-\[#38bdf8\] text-\[#38bdf8\]" : "bg-\[#062016\] border-emerald-500\/40 hover:border-emerald-400 text-emerald-300"/g,
    'isNoir ? "bg-[#1a1410] border-[#d4a647]/60 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/60 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#062016] border-emerald-500/40 hover:border-emerald-400 text-emerald-300"'
  );
  code = code.replace(
    /\{isSoviet \? "Прервать миссию \(Аварийное закрытие\)" : "Сдаться \/ Покинуть стол"\}/,
    "{isNoir ? 'Закрыть дело (Сдаться)' : isSoviet ? 'Прервать миссию (Аварийное закрытие)' : 'Сдаться / Покинуть стол'}"
  );

  fs.writeFileSync(p, code);
}

function updatePlayersSidebar() {
  const p = '/Users/frolov/Desktop/monopoly/src/components/hud/PlayersSidebar.tsx';
  let code = fs.readFileSync(p, 'utf8');

  if (!code.includes('const isNoir = theme === \'noir\';')) {
    code = code.replace(/const isSoviet = theme === 'soviet';/, "const isSoviet = theme === 'soviet';\n  const isNoir = theme === 'noir';");
  }

  code = code.replace(
    /isSoviet \? 'bg-\[#111820\] border-\[#2A3848\] font-soviet' : 'bg-\[#081d14\] border-emerald-500\/40 font-sans'/,
    "isNoir ? 'bg-[#1a1410] border-[#3d2e1a] font-noir-body' : isSoviet ? 'bg-[#111820] border-[#2A3848] font-soviet' : 'bg-[#081d14] border-emerald-500/40 font-sans'"
  );
  code = code.replace(
    /isSoviet \? "border-\[#38bdf8\]\/40" : "border-emerald-500\/30"/,
    'isNoir ? "border-[#d4a647]/40" : isSoviet ? "border-[#38bdf8]/40" : "border-emerald-500/30"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#dc2626\]" : "text-emerald-400"/,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#dc2626]" : "text-emerald-400"'
  );
  code = code.replace(
    /\{isSoviet \? "★" : "👥"\}/,
    '{isNoir ? "🔍" : isSoviet ? "★" : "👥"}'
  );
  code = code.replace(
    /isSoviet \? "text-\[#e2e8f0\]" : "text-white"/g,
    'isNoir ? "text-[#f5e6c8]" : isSoviet ? "text-[#e2e8f0]" : "text-white"'
  );
  code = code.replace(
    /\{isSoviet \? 'РЕЕСТР ЭКИПАЖЕЙ' : 'СПИСОК ИГРОКОВ'\}/,
    "{isNoir ? 'ДОСЬЕ ПОДОЗРЕВАЕМЫХ' : isSoviet ? 'РЕЕСТР ЭКИПАЖЕЙ' : 'СПИСОК ИГРОКОВ'}"
  );
  code = code.replace(
    /isSoviet \? "font-space bg-\[#09111c\] border-\[#38bdf8\] text-\[#38bdf8\]" : "bg-\[#062016\] border-emerald-500\/50 text-emerald-300 font-sans"/,
    'isNoir ? "font-noir-body bg-[#1a1410] border-[#d4a647] text-[#d4a647]" : isSoviet ? "font-space bg-[#09111c] border-[#38bdf8] text-[#38bdf8]" : "bg-[#062016] border-emerald-500/50 text-emerald-300 font-sans"'
  );
  code = code.replace(
    /\{isSoviet \? `\$\{team\.money\} кР` : `\$\$\{team\.money\.toLocaleString\(\)\}`\}/,
    "{isNoir ? `$${team.money.toLocaleString()}` : isSoviet ? `${team.money} кР` : `$${team.money.toLocaleString()}`}"
  );
  code = code.replace(
    /\{isSoviet \? `\$\{player\.money\} кР` : `\$\$\{player\.money\.toLocaleString\(\)\}`\}/g,
    "{isNoir ? `$${player.money.toLocaleString()}` : isSoviet ? `${player.money} кР` : `$${player.money.toLocaleString()}`}"
  );
  code = code.replace(
    /isCurrentTurn\s*\?\s*\(isSoviet \? 'bg-\[#0369a1\] border-\[#38bdf8\] shadow-md scale-\[1\.01\]' : 'bg-emerald-800\/80 border-emerald-400 shadow-md scale-\[1\.01\]'\)\s*:\s*\(isSoviet \? 'bg-\[#0f172a\] border-\[#1e293b\]' : 'bg-\[#061c14\] border-slate-700\/60'\)/g,
    "isCurrentTurn ? (isNoir ? 'bg-[#2a2018] border-[#d4a647] shadow-md scale-[1.01] noir-desk-glow' : isSoviet ? 'bg-[#0369a1] border-[#38bdf8] shadow-md scale-[1.01]' : 'bg-emerald-800/80 border-emerald-400 shadow-md scale-[1.01]') : (isNoir ? 'noir-suspect-card' : isSoviet ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#061c14] border-slate-700/60')"
  );
  code = code.replace(
    /isSoviet \? "bg-\[#050b14\] border-\[#38bdf8\]" : "bg-\[#04150e\] border-emerald-500\/50"/g,
    'isNoir ? "bg-[#1a1410] border-[#d4a647]/50" : isSoviet ? "bg-[#050b14] border-[#38bdf8]" : "bg-[#04150e] border-emerald-500/50"'
  );
  code = code.replace(
    /isSoviet \? "font-soviet text-\[#e2e8f0\]" : "text-white font-sans"/g,
    'isNoir ? "font-noir-body text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white font-sans"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#38bdf8\]" : "text-emerald-400"/g,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-emerald-400"'
  );
  code = code.replace(
    /\{isSoviet \? 'ОБМЕН' : 'СДЕЛКА'\}/g,
    "{isNoir ? 'СДЕЛКА' : isSoviet ? 'ОБМЕН' : 'СДЕЛКА'}"
  );
  code = code.replace(
    /isSoviet \? "font-space text-\[#38bdf8\]" : "text-emerald-400 font-sans"/g,
    'isNoir ? "font-noir-body text-[#d4a647]" : isSoviet ? "font-space text-[#38bdf8]" : "text-emerald-400 font-sans"'
  );
  code = code.replace(
    /\{isSoviet \? 'КАРАНТИН' : 'В ТЮРЬМЕ'\}/g,
    "{isNoir ? 'В КАТАЛАЖКЕ' : isSoviet ? 'КАРАНТИН' : 'В ТЮРЬМЕ'}"
  );
  code = code.replace(
    /stroke=\{isSoviet \? "#38bdf8" : "#ffffff"\}/g,
    'stroke={isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#ffffff"}'
  );
  code = code.replace(
    /isSoviet \? "soviet-btn-red" : "classic-btn-danger"/,
    'isNoir ? "noir-btn-blood" : isSoviet ? "soviet-btn-red" : "classic-btn-danger"'
  );
  code = code.replace(
    /\{isSoviet \? "Покинуть ЦУП" : "Выйти из игры"\}/,
    '{isNoir ? "Закрыть дело" : isSoviet ? "Покинуть ЦУП" : "Выйти из игры"}'
  );
  code = code.replace(
    /\{isSoviet \? "Прервать миссию" : "Сдаться"\}/,
    '{isNoir ? "Закрыть дело" : isSoviet ? "Прервать миссию" : "Сдаться"}'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f172a\] border-\[#38bdf8\]\/50 hover:border-\[#38bdf8\] text-\[#38bdf8\]" : "bg-\[#062016\] border-emerald-500\/40 hover:border-emerald-400 text-emerald-300"/g,
    'isNoir ? "bg-[#1a1410] border-[#d4a647]/50 hover:border-[#d4a647] text-[#d4a647]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/50 hover:border-[#38bdf8] text-[#38bdf8]" : "bg-[#062016] border-emerald-500/40 hover:border-emerald-400 text-emerald-300"'
  );
  code = code.replace(
    /\{isSoviet \? "Регламент космических полётов" : "Правила игры"\}/,
    '{isNoir ? "КОДЕКС СЫЩИКА" : isSoviet ? "Регламент космических полётов" : "Правила игры"}'
  );

  fs.writeFileSync(p, code);
}

function updateRightPanel() {
  const p = '/Users/frolov/Desktop/monopoly/src/components/hud/RightPanel.tsx';
  let code = fs.readFileSync(p, 'utf8');

  if (!code.includes('const isNoir = theme === \'noir\';')) {
    code = code.replace(/const isSoviet = theme === 'soviet';/, "const isSoviet = theme === 'soviet';\n  const isNoir = theme === 'noir';");
  }

  code = code.replace(
    /isSoviet \? "bg-\[#111820\] border-\[#2A3848\] font-soviet" : "bg-\[#081d14\] border-emerald-500\/40 font-sans"/,
    'isNoir ? "noir-panel" : isSoviet ? "bg-[#111820] border-[#2A3848] font-soviet" : "bg-[#081d14] border-emerald-500/40 font-sans"'
  );
  code = code.replace(
    /isSoviet \? "soviet-steel-panel text-\[#e2e8f0\] border-\[#38bdf8\] font-soviet" : "classic-panel text-white border-emerald-500\/40 font-sans"/,
    'isNoir ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet" : "classic-panel text-white border-emerald-500/40 font-sans"'
  );
  code = code.replace(
    /isSoviet \? "border-\[#38bdf8\]\/40 bg-\[#0f1a28\]" : "border-emerald-500\/30 bg-\[#061f15\]"/,
    'isNoir ? "border-[#d4a647]/40 bg-[#1a1410]" : isSoviet ? "border-[#38bdf8]/40 bg-[#0f1a28]" : "border-emerald-500/30 bg-[#061f15]"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#38bdf8\]" : "text-emerald-400"/g,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-emerald-400"'
  );
  code = code.replace(
    /isSoviet \? "font-soviet text-\[#e2e8f0\]" : "font-sans text-white"/g,
    'isNoir ? "font-noir-title text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "font-sans text-white"'
  );
  code = code.replace(
    /isSoviet \? "ПАСПОРТ ОБЪЕКТА ОКБ-1" : "ДОКУМЕНТ НА СОБСТВЕННОСТЬ"/,
    'isNoir ? "ДОСЬЕ НА ТЕРРИТОРИЮ" : isSoviet ? "ПАСПОРТ ОБЪЕКТА ОКБ-1" : "ДОКУМЕНТ НА СОБСТВЕННОСТЬ"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0c1420\]" : "bg-\[#05170f\]"/,
    'isNoir ? "bg-[#14100c]" : isSoviet ? "bg-[#0c1420]" : "bg-[#05170f]"'
  );
  code = code.replace(
    /isSoviet \? "border-\[#38bdf8\]\/50" : "border-emerald-500\/40"/,
    'isNoir ? "border-[#d4a647]/50" : isSoviet ? "border-[#38bdf8]/50" : "border-emerald-500/40"'
  );
  code = code.replace(
    /\(isSoviet \? "#0369a1" : "#059669"\)/g,
    '(isNoir ? "#8b0000" : isSoviet ? "#0369a1" : "#059669")'
  );
  code = code.replace(
    /isSoviet \? "СЕКТОР ОРБИТЫ" : "ГРУППА"/,
    'isNoir ? "СЕКТОР" : isSoviet ? "СЕКТОР ОРБИТЫ" : "ГРУППА"'
  );
  code = code.replace(
    /isSoviet \? "ОБЪЕКТ ЦУП" : "СПЕЦИАЛЬНОЕ ПОЛЕ"/,
    'isNoir ? "ДЕТАЛИ ДЕЛА" : isSoviet ? "ОБЪЕКТ ЦУП" : "СПЕЦИАЛЬНОЕ ПОЛЕ"'
  );
  code = code.replace(
    /isSoviet \? "font-soviet" : "font-sans"/g,
    'isNoir ? "font-noir-title" : isSoviet ? "font-soviet" : "font-sans"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f172a\] border-\[#38bdf8\]\/30 text-\[#e2e8f0\]" : "bg-\[#082216\] border-emerald-500\/30 text-slate-100"/,
    'isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#0f172a] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#082216] border-emerald-500/30 text-slate-100"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#09111c\] border-\[#38bdf8\]\/20" : "bg-\[#04150e\] border-emerald-500\/20"/,
    'isNoir ? "bg-[#14100c] border-[#d4a647]/20" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/20" : "bg-[#04150e] border-emerald-500/20"'
  );
  code = code.replace(
    /isSoviet \? "ПРИКАЗ ГОСКОМИССИИ:" : "ПРАВИЛА ПОЛЯ:"/,
    'isNoir ? "УЛИКИ:" : isSoviet ? "ПРИКАЗ ГОСКОМИССИИ:" : "ПРАВИЛА ПОЛЯ:"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#09111c\] border-\[#38bdf8\]\/30 font-space" : "bg-\[#062016\] border-emerald-500\/30 font-sans"/g,
    'isNoir ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 font-space" : "bg-[#062016] border-emerald-500/30 font-sans"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#94a3b8\] border-\[#38bdf8\]\/20" : "text-emerald-400 border-emerald-500\/20"/g,
    'isNoir ? "text-[#b8a890] border-[#d4a647]/20" : isSoviet ? "text-[#94a3b8] border-[#38bdf8]/20" : "text-emerald-400 border-emerald-500/20"'
  );
  code = code.replace(
    /\{isSoviet \? "ТАРИФ КОСМОДРОМА" : "ТАРИФ СТАНЦИИ"\}/,
    '{isNoir ? "ТАРИФ" : isSoviet ? "ТАРИФ КОСМОДРОМА" : "ТАРИФ СТАНЦИИ"}'
  );
  code = code.replace(
    /\{isSoviet \? "кР" : "\$"\}/g,
    '{isNoir ? "$" : isSoviet ? "кР" : "$"}'
  );
  code = code.replace(
    /isSoviet \? "text-\[#00e676\]" : "text-emerald-300"/g,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#00e676]" : "text-emerald-300"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#38bdf8\]" : "text-amber-400"/g,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-amber-400"'
  );
  code = code.replace(
    /isSoviet \? "border-\[#38bdf8\]\/30 font-space" : "border-emerald-500\/30 font-sans"/g,
    'isNoir ? "border-[#d4a647]/30 font-noir-body" : isSoviet ? "border-[#38bdf8]/30 font-space" : "border-emerald-500/30 font-sans"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f1f33\] border-\[#38bdf8\]\/30 text-\[#e2e8f0\]" : "bg-\[#08281c\] border-emerald-500\/40 text-emerald-100"/g,
    'isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#f5e6c8]" : isSoviet ? "bg-[#0f1f33] border-[#38bdf8]/30 text-[#e2e8f0]" : "bg-[#08281c] border-emerald-500/40 text-emerald-100"'
  );
  code = code.replace(
    /isSoviet \? "БАЛАНСОВАЯ СТОИМОСТЬ" : "СТОИМОСТЬ ПОКУПКИ"/g,
    'isNoir ? "СТОИМОСТЬ" : isSoviet ? "БАЛАНСОВАЯ СТОИМОСТЬ" : "СТОИМОСТЬ ПОКУПКИ"'
  );
  code = code.replace(
    /isSoviet \? "АВАРИЙНЫЙ РЕЗЕРВ" : "ЗАЛОГОВАЯ СТОИМОСТЬ"/g,
    'isNoir ? "ЗАЛОГ У РОСТОВЩИКА" : isSoviet ? "АВАРИЙНЫЙ РЕЗЕРВ" : "ЗАЛОГОВАЯ СТОИМОСТЬ"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#00e676\]" : "text-emerald-400"/g,
    'isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#00e676]" : "text-emerald-400"'
  );
  code = code.replace(
    /isSoviet \? "soviet-btn-cyan" : "classic-btn-primary"/g,
    'isNoir ? "noir-btn-amber" : isSoviet ? "soviet-btn-cyan" : "classic-btn-primary"'
  );
  code = code.replace(
    /isSoviet \? "soviet-btn-steel text-\[#fca5a5\] border-\[#dc2626\]" : "classic-btn-danger"/g,
    'isNoir ? "noir-btn-smoke" : isSoviet ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626]" : "classic-btn-danger"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#09111c\] border-\[#38bdf8\]\/30 text-\[#94a3b8\]" : "bg-\[#04170e\] border-emerald-500\/30 text-emerald-300"/g,
    'isNoir ? "bg-[#1a1410] border-[#d4a647]/30 text-[#b8a890]" : isSoviet ? "bg-[#09111c] border-[#38bdf8]/30 text-[#94a3b8]" : "bg-[#04170e] border-emerald-500/30 text-emerald-300"'
  );

  code = code.replace(
    /\{isSoviet\s*\?\s*`РАСКОНСЕРВАЦИЯ \(\$\{Math\.round\(\(displayTile\.mortgageValue \|\| \d+\) \* 1\.1\)\} кР\)`\s*:\s*`ВЫКУПИТЬ ИЗ ЗАЛОГА \(-\$\$\{Math\.round\(\(displayTile\.mortgageValue \|\| \d+\) \* 1\.1\)\}\)`\}/g,
    (match) => match.replace('{isSoviet', '{isNoir ? `ВЫКУПИТЬ У РОСТОВЩИКА (-$${Math.round((displayTile.mortgageValue || 100) * 1.1)})` : isSoviet')
  );
  code = code.replace(
    /\{isSoviet\s*\?\s*`КОНСЕРВАЦИЯ \(\+\$\{displayTile\.mortgageValue \|\| .*?\} кР\)`\s*:\s*`ЗАЛОЖИТЬ В БАНК \(\+\$\$\{displayTile\.mortgageValue \|\| .*?\}\)`\}/g,
    (match) => match.replace('{isSoviet', '{isNoir ? `ЗАЛОЖИТЬ У РОСТОВЩИКА (+$${displayTile.mortgageValue || 100})` : isSoviet')
  );

  code = code.replace(
    /isSoviet \? "КОМАНДИР: " : "ВЛАДЕЛЕЦ: "/g,
    'isNoir ? "ВЛАДЕЛЕЦ: " : isSoviet ? "КОМАНДИР: " : "ВЛАДЕЛЕЦ: "'
  );
  code = code.replace(
    /isSoviet \? "\[В РЕЗЕРВЕ\]" : "\[ЗАЛОЖЕНО\]"/g,
    'isNoir ? "[В ЗАЛОГЕ]" : isSoviet ? "[В РЕЗЕРВЕ]" : "[ЗАЛОЖЕНО]"'
  );
  code = code.replace(
    /isSoviet \? "#38bdf8" : "#10b981"/g,
    'isNoir ? "#d4a647" : isSoviet ? "#38bdf8" : "#10b981"'
  );
  code = code.replace(
    /isSoviet \? "СВОБОДНЫЙ КОСМОДРОМ" : "СВОБОДНЫЙ ОБЪЕКТ"/,
    'isNoir ? "СВОБОДНО" : isSoviet ? "СВОБОДНЫЙ КОСМОДРОМ" : "СВОБОДНЫЙ ОБЪЕКТ"'
  );
  code = code.replace(
    /\{isSoviet \? "ТАРИФ ЭНЕРГОСЕТИ СССР" : "КОММУНАЛЬНЫЙ ТАРИФ"\}/,
    '{isNoir ? "ТАРИФ" : isSoviet ? "ТАРИФ ЭНЕРГОСЕТИ СССР" : "КОММУНАЛЬНЫЙ ТАРИФ"}'
  );
  code = code.replace(
    /isSoviet \? "ОПЕРАТОР: " : "ВЛАДЕЛЕЦ: "/,
    'isNoir ? "ВЛАДЕЛЕЦ: " : isSoviet ? "ОПЕРАТОР: " : "ВЛАДЕЛЕЦ: "'
  );
  code = code.replace(
    /isSoviet \? "СВОБОДНЫЙ ЭНЕРГОСЕКТОР" : "СВОБОДНОЕ ПРЕДПРИЯТИЕ"/,
    'isNoir ? "СВОБОДНО" : isSoviet ? "СВОБОДНЫЙ ЭНЕРГОСЕКТОР" : "СВОБОДНОЕ ПРЕДПРИЯТИЕ"'
  );
  code = code.replace(
    /isSoviet \? "ТЕЛЕМЕТРИЯ СБОРА \(ТАРИФ\)" : "ТАБЛИЦА АРЕНДЫ"/,
    'isNoir ? "ДАНЬ (АРЕНДА)" : isSoviet ? "ТЕЛЕМЕТРИЯ СБОРА (ТАРИФ)" : "ТАБЛИЦА АРЕНДЫ"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f1f33\] font-bold text-\[#38bdf8\]" : "bg-emerald-900\/60 font-bold text-emerald-300"/g,
    'isNoir ? "bg-[#1a1410] font-bold text-[#d4a647]" : isSoviet ? "bg-[#0f1f33] font-bold text-[#38bdf8]" : "bg-emerald-900/60 font-bold text-emerald-300"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#260a0e\] font-bold text-\[#fca5a5\]" : "bg-red-950\/70 font-bold text-red-300"/,
    'isNoir ? "bg-[#2a1010] font-bold text-[#ff4444]" : isSoviet ? "bg-[#260a0e] font-bold text-[#fca5a5]" : "bg-red-950/70 font-bold text-red-300"'
  );
  code = code.replace(
    /isSoviet \? "text-\[#38bdf8\] border-\[#38bdf8\]\/20" : "text-amber-400 border-emerald-500\/20"/,
    'isNoir ? "text-[#d4a647] border-[#d4a647]/20" : isSoviet ? "text-[#38bdf8] border-[#38bdf8]/20" : "text-amber-400 border-emerald-500/20"'
  );
  code = code.replace(
    /isSoviet \? "БАЛАНС СЕКТОРА" : "СТОИМОСТЬ ПОКУПКИ"/,
    'isNoir ? "СТОИМОСТЬ" : isSoviet ? "БАЛАНС СЕКТОРА" : "СТОИМОСТЬ ПОКУПКИ"'
  );
  code = code.replace(
    /isSoviet \? `\+МОДУЛЬ \(\$\{currentUpgradeCost\} кР\)` : `\+ДОМ \(\$\$\{currentUpgradeCost\}\)`/,
    'isNoir ? `+ЯВКА ($${currentUpgradeCost})` : isSoviet ? `+МОДУЛЬ (${currentUpgradeCost} кР)` : `+ДОМ ($${currentUpgradeCost})`'
  );
  code = code.replace(
    /isSoviet \? `ДЕМОНТАЖ \(\+\$\{currentSellRefund\} кР\)` : `-ДОМ \(\+\$\$\{currentSellRefund\}\)`/,
    'isNoir ? `-ЯВКА (+$${currentSellRefund})` : isSoviet ? `ДЕМОНТАЖ (+${currentSellRefund} кР)` : `-ДОМ (+$${currentSellRefund})`'
  );
  code = code.replace(
    /isSoviet \? "СВОБОДНЫЙ ОРБИТАЛЬНЫЙ СЕКТОР" : "СВОБОДНАЯ УЛИЦА"/,
    'isNoir ? "СВОБОДНО" : isSoviet ? "СВОБОДНЫЙ ОРБИТАЛЬНЫЙ СЕКТОР" : "СВОБОДНАЯ УЛИЦА"'
  );

  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rents\[0\]\} кР` : `\$\$\{displayTile\.rents\[0\]\}`\}/, "{isNoir ? `$${displayTile.rents[0]}` : isSoviet ? `${displayTile.rents[0]} кР` : `$${displayTile.rents[0]}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rents\[1\]\} кР` : `\$\$\{displayTile\.rents\[1\]\}`\}/, "{isNoir ? `$${displayTile.rents[1]}` : isSoviet ? `${displayTile.rents[1]} кР` : `$${displayTile.rents[1]}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rents\[2\]\} кР` : `\$\$\{displayTile\.rents\[2\]\}`\}/, "{isNoir ? `$${displayTile.rents[2]}` : isSoviet ? `${displayTile.rents[2]} кР` : `$${displayTile.rents[2]}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rents\[3\]\} кР` : `\$\$\{displayTile\.rents\[3\]\}`\}/, "{isNoir ? `$${displayTile.rents[3]}` : isSoviet ? `${displayTile.rents[3]} кР` : `$${displayTile.rents[3]}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rents\[4\]\} кР` : `\$\$\{displayTile\.rents\[4\]\}`\}/, "{isNoir ? `$${displayTile.rents[4]}` : isSoviet ? `${displayTile.rents[4]} кР` : `$${displayTile.rents[4]}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rents\[5\]\} кР` : `\$\$\{displayTile\.rents\[5\]\}`\}/, "{isNoir ? `$${displayTile.rents[5]}` : isSoviet ? `${displayTile.rents[5]} кР` : `$${displayTile.rents[5]}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rents\[0\] \* 2\} кР` : `\$\$\{displayTile\.rents\[0\] \* 2\}`\}/, "{isNoir ? `$${displayTile.rents[0] * 2}` : isSoviet ? `${displayTile.rents[0] * 2} кР` : `$${displayTile.rents[0] * 2}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.rent \|\| 25\} кР` : `\$\$\{displayTile\.rent \|\| 25\}`\}/, "{isNoir ? `$${displayTile.rent || 25}` : isSoviet ? `${displayTile.rent || 25} кР` : `$${displayTile.rent || 25}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.price \|\| 0\} кР` : `\$\$\{displayTile\.price \|\| 0\}`\}/, "{isNoir ? `$${displayTile.price || 0}` : isSoviet ? `${displayTile.price || 0} кР` : `$${displayTile.price || 0}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.mortgageValue \|\| Math\.round\(\(displayTile\.price \|\| 60\) \/ 2\)\} кР` : `\$\$\{displayTile\.mortgageValue \|\| Math\.round\(\(displayTile\.price \|\| 60\) \/ 2\)\}`\}/, "{isNoir ? `$${displayTile.mortgageValue || Math.round((displayTile.price || 60) / 2)}` : isSoviet ? `${displayTile.mortgageValue || Math.round((displayTile.price || 60) / 2)} кР` : `$${displayTile.mortgageValue || Math.round((displayTile.price || 60) / 2)}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.price \|\| 150\} кР` : `\$\$\{displayTile\.price \|\| 150\}`\}/, "{isNoir ? `$${displayTile.price || 150}` : isSoviet ? `${displayTile.price || 150} кР` : `$${displayTile.price || 150}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.mortgageValue \|\| 75\} кР` : `\$\$\{displayTile\.mortgageValue \|\| 75\}`\}/, "{isNoir ? `$${displayTile.mortgageValue || 75}` : isSoviet ? `${displayTile.mortgageValue || 75} кР` : `$${displayTile.mortgageValue || 75}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.price \|\| 200\} кР` : `\$\$\{displayTile\.price \|\| 200\}`\}/, "{isNoir ? `$${displayTile.price || 200}` : isSoviet ? `${displayTile.price || 200} кР` : `$${displayTile.price || 200}`}");
  code = code.replace(/\{isSoviet \? `\$\{displayTile\.mortgageValue \|\| 100\} кР` : `\$\$\{displayTile\.mortgageValue \|\| 100\}`\}/, "{isNoir ? `$${displayTile.mortgageValue || 100}` : isSoviet ? `${displayTile.mortgageValue || 100} кР` : `$${displayTile.mortgageValue || 100}`}");
  
  code = code.replace(
    /isSoviet \? "bg-\[#09111c\] border-\[#38bdf8\] font-space" : "bg-\[#061f15\] border-emerald-500\/40 font-sans"/,
    'isNoir ? "bg-[#1a1410] border-[#d4a647] font-noir-body" : isSoviet ? "bg-[#09111c] border-[#38bdf8] font-space" : "bg-[#061f15] border-emerald-500/40 font-sans"'
  );
  code = code.replace(
    /isSoviet \? "border-\[#38bdf8\]\/40 bg-\[#0c1624\]" : "border-emerald-500\/30 bg-\[#04150e\]"/,
    'isNoir ? "border-[#d4a647]/40 bg-[#14100c]" : isSoviet ? "border-[#38bdf8]/40 bg-[#0c1624]" : "border-emerald-500/30 bg-[#04150e]"'
  );
  code = code.replace(
    /isSoviet \? "font-soviet text-\[#e2e8f0\]" : "text-white"/,
    'isNoir ? "font-noir-title text-[#f5e6c8]" : isSoviet ? "font-soviet text-[#e2e8f0]" : "text-white"'
  );
  code = code.replace(
    /isSoviet \? "СВЯЗЬ ЦУП \(142\.1 МГц\)" : "ОБЩИЙ ЧАТ СТОЛА"/,
    'isNoir ? "ТЕЛЕТАЙП (СЛУЖЕБНАЯ СВЯЗЬ)" : isSoviet ? "СВЯЗЬ ЦУП (142.1 МГц)" : "ОБЩИЙ ЧАТ СТОЛА"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#050b14\] border-\[#38bdf8\]\/50 text-\[#38bdf8\]" : "bg-\[#062016\] border-emerald-500\/50 text-emerald-300"/,
    'isNoir ? "bg-[#14100c] border-[#d4a647]/50 text-[#d4a647]" : isSoviet ? "bg-[#050b14] border-[#38bdf8]/50 text-[#38bdf8]" : "bg-[#062016] border-emerald-500/50 text-emerald-300"'
  );
  code = code.replace(
    /isSoviet \? "\[ В ЭФИРЕ ТИШИНА\. КАНАЛ СВЯЗИ ОТКРЫТ \]" : "\[ В ЧАТЕ ПОКА НЕТ СООБЩЕНИЙ \]"/,
    'isNoir ? "[ ТЕЛЕТАЙП МОЛЧИТ ]" : isSoviet ? "[ В ЭФИРЕ ТИШИНА. КАНАЛ СВЯЗИ ОТКРЫТ ]" : "[ В ЧАТЕ ПОКА НЕТ СООБЩЕНИЙ ]"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0369a1\] border-\[#38bdf8\] self-end max-w-\[90%\]" : "bg-emerald-900\/80 border-emerald-500 self-end max-w-\[90%\]"/,
    'isNoir ? "bg-[#2a2018] border-[#d4a647] self-end max-w-[90%]" : isSoviet ? "bg-[#0369a1] border-[#38bdf8] self-end max-w-[90%]" : "bg-emerald-900/80 border-emerald-500 self-end max-w-[90%]"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f172a\] border-\[#1e293b\] self-start max-w-\[90%\]" : "bg-slate-900\/80 border-slate-700 self-start max-w-\[90%\]"/,
    'isNoir ? "bg-[#1a1410] border-[#3d2e1a] self-start max-w-[90%]" : isSoviet ? "bg-[#0f172a] border-[#1e293b] self-start max-w-[90%]" : "bg-slate-900/80 border-slate-700 self-start max-w-[90%]"'
  );
  code = code.replace(
    /isSoviet \? "border-\[#38bdf8\]\/40 bg-\[#050b14\]" : "border-emerald-500\/30 bg-\[#04150e\]"/,
    'isNoir ? "border-[#d4a647]/40 bg-[#14100c]" : isSoviet ? "border-[#38bdf8]/40 bg-[#050b14]" : "border-emerald-500/30 bg-[#04150e]"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#09111c\] text-\[#e2e8f0\] placeholder:text-\[#38bdf8\]\/50" : "bg-\[#062016\] text-white placeholder:text-emerald-500\/50"/,
    'isNoir ? "bg-[#14100c] text-[#f5e6c8] placeholder:text-[#b8a890]/50" : isSoviet ? "bg-[#09111c] text-[#e2e8f0] placeholder:text-[#38bdf8]/50" : "bg-[#062016] text-white placeholder:text-emerald-500/50"'
  );
  code = code.replace(
    /isSoviet \? 'Доложить обстановку\.\.\.' : 'Написать в чат\.\.\.'/,
    'isNoir ? "Печатайте донесение..." : isSoviet ? "Доложить обстановку..." : "Написать в чат..."'
  );
  code = code.replace(
    /isSoviet \? "text-\[#38bdf8\] hover:text-\[#7dd3fc\] bg-\[#09111c\]" : "text-emerald-400 hover:text-emerald-300 bg-\[#062016\]"/,
    'isNoir ? "text-[#d4a647] hover:text-[#f5e6c8] bg-[#1a1410]" : isSoviet ? "text-[#38bdf8] hover:text-[#7dd3fc] bg-[#09111c]" : "text-emerald-400 hover:text-emerald-300 bg-[#062016]"'
  );
  code = code.replace(
    /isSoviet \? "bg-\[#0f172a\] border-\[#1e293b\] text-\[#94a3b8\]" : "bg-slate-900\/80 border-slate-700 text-slate-400"/,
    'isNoir ? "bg-[#1a1410] border-[#3d2e1a] text-[#b8a890]" : isSoviet ? "bg-[#0f172a] border-[#1e293b] text-[#94a3b8]" : "bg-slate-900/80 border-slate-700 text-slate-400"'
  );
  code = code.replace(
    /isSoviet \? 'Авторизуйтесь для связи' : 'Войдите, чтобы писать в чат'/,
    'isNoir ? "Нужен допуск (войдите)" : isSoviet ? "Авторизуйтесь для связи" : "Войдите, чтобы писать в чат"'
  );

  fs.writeFileSync(p, code);
}

try {
  updateTopBar();
  updatePlayersSidebar();
  updateRightPanel();
  console.log('Update successful');
} catch (err) {
  console.error(err);
}
