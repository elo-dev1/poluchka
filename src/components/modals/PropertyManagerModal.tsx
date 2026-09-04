
import React from "react";
import { useGame } from "@/context/GameContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Plus, Minus, Landmark, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TileIconImage, PixelIcons } from "@/lib/pixelIcons";
import {
  canBuildHouse,
  canSellHouse,
  canMortgage,
  canUnmortgage,
  hasMonopoly,
} from "@/lib/propertyRules";

export const PropertyManagerModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    gameState,
    playerId,
    buildHouse,
    sellHouse,
    mortgageProperty,
    unmortgageProperty,
    theme,
  } = useGame();

  const isOpen = activeModal === "propertyManager";
  const isSoviet = theme === "soviet";
  const isNoir = theme === "noir";

  if (!gameState) return null;

  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const isTeamMode = gameState.gameMode === "team";
  const myTiles = gameState.board.filter(
    (t) =>
      t.ownerId === playerId ||
      (isTeamMode &&
        myPlayer?.teamId &&
        (t.teamId === myPlayer.teamId ||
          gameState.players.find((p) => p.id === t.ownerId)?.teamId === myPlayer.teamId))
  );

  const isMyTurn = Boolean(
    gameState.players[gameState.currentTurnIndex]?.id === playerId &&
      gameState.status !== "GAME_OVER" &&
      gameState.status !== "LOBBY"
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className={cn(
          "max-w-lg max-h-[85vh] flex flex-col shadow-2xl rounded-none border",
          isNoir
            ? "noir-panel text-[#f5e6c8] border-[#d4a647] font-noir-body"
            : isSoviet
            ? "soviet-steel-panel text-[#e2e8f0] border-[#38bdf8] font-soviet"
            : "classic-panel text-white border-slate-500/50 font-sans"
        )}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle
              className={cn(
                "flex items-center gap-2 font-bold text-base sm:text-lg",
                isNoir
                  ? "font-noir-title text-[#d4a647]"
                  : isSoviet
                  ? "font-soviet text-[#e2e8f0]"
                  : "text-white"
              )}
            >
              <Building2
                className={cn(
                  "w-5 h-5",
                  isNoir ? "text-[#d4a647]" : isSoviet ? "text-[#38bdf8]" : "text-slate-400"
                )}
              />
              {isNoir
                ? `КАРТОТЕКА ТЕРРИТОРИЙ (${myTiles.length})`
                : isSoviet
                ? `РЕЕСТР ОБЪЕКТОВ (ОКБ-1 • ${myTiles.length})`
                : `УПРАВЛЕНИЕ АКТИВАМИ (${myTiles.length})`}
            </DialogTitle>
            {!isMyTurn && (
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-none border",
                  isNoir
                    ? "font-noir-body bg-[#1a1410] border-[#d4a647]/40 text-[#d4a647]"
                    : isSoviet
                    ? "font-space bg-[#09111c] border-[#38bdf8]/40 text-[#38bdf8]"
                    : "bg-[#020617] border-slate-500/40 text-slate-300"
                )}
              >
                {isNoir
                  ? "⏳ Только в ваш ход"
                  : isSoviet
                  ? "⏳ Только во время сеанса связи"
                  : "⏳ Только в свой ход"}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 my-2">
          {myTiles.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#94a3b8]">
              {isNoir ? (
                <>
                  В вашем досье пока нет территорий.
                  <br />
                  Выходите на улицы и берите город под свой контроль! 🕵️
                </>
              ) : isSoviet ? (
                <>
                  У вас пока нет подконтрольных секторов и станций.
                  <br />
                  Используйте импульс гироскопов и осваивайте космодромы! 🚀
                </>
              ) : (
                <>
                  У вас пока нет выкупленных активов.
                  <br />
                  Покупайте свободные компании при остановке на них! 🏢
                </>
              )}
            </div>
          ) : (
            myTiles.map((tile) => {
              const buildVal = canBuildHouse(tile, gameState, playerId);
              const sellVal = canSellHouse(tile, gameState, playerId);
              const mortgageVal = canMortgage(tile, gameState, playerId);
              const unmortgageVal = canUnmortgage(tile, gameState, playerId);
              const isMonopoly = hasMonopoly(
                gameState.board,
                playerId,
                tile.group,
                isTeamMode,
                myPlayer?.teamId,
                gameState.players
              );

              return (
                <div
                  key={tile.id}
                  className={cn(
                    "flex flex-col gap-1.5 p-2.5 rounded-none border",
                    isNoir
                      ? "bg-[#1a1410] border-[#d4a647]/30 font-noir-body"
                      : isSoviet
                      ? "bg-[#09111c] border-[#38bdf8]/30 font-space"
                      : "bg-[#020617] border-slate-500/30 font-sans"
                  )}
                >
                  {/* Title Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        <TileIconImage
                          tile={tile}
                          className="w-full h-full object-contain filter contrast-125 brightness-95"
                        />
                      </div>
                      {tile.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-none shrink-0 border border-black/40"
                          style={{ backgroundColor: tile.color }}
                        />
                      )}
                      <span
                        className={cn(
                          "text-xs font-bold",
                          isNoir
                            ? "font-noir-title text-[#d4a647]"
                            : isSoviet
                            ? "font-soviet text-[#e2e8f0]"
                            : "text-white"
                        )}
                      >
                        {tile.name}
                      </span>
                      {isMonopoly && (
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-none bg-[#0284c7] text-white">
                          МОНОПОЛИЯ
                        </span>
                      )}
                      {tile.isMortgaged && (
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-none bg-[#dc2626] text-white">
                          {isNoir ? "В ЗАЛОГЕ" : isSoviet ? "РЕЗЕРВ" : "ЗАЛОГ"}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isNoir
                          ? "font-noir-title text-[#d4a647]"
                          : isSoviet
                          ? "font-space text-[#00e676]"
                          : "text-slate-300"
                      )}
                    >
                      {isNoir
                        ? `Дань: $${tile.currentRent || tile.rent || 0}`
                        : isSoviet
                        ? `Сбор: ${tile.currentRent || tile.rent || 0} кР`
                        : `Рента: $${tile.currentRent || tile.rent || 0}`}
                    </span>
                  </div>

                  {/* Houses Row & Action Controls */}
                  <div
                    className={cn(
                      "flex items-center justify-between pt-1 border-t",
                      isNoir
                        ? "border-[#d4a647]/20"
                        : isSoviet
                        ? "border-[#38bdf8]/20"
                        : "border-slate-500/20"
                    )}
                  >
                    {/* Houses indicator */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#94a3b8] mr-1">
                        {isNoir ? "Явки:" : isSoviet ? "Модули:" : "Постройки:"}
                      </span>
                      {tile.houses && tile.houses > 0 ? (
                        tile.houses === 5 ? (
                          <span
                            className={cn(
                              "text-xs font-bold flex items-center gap-1",
                              isNoir
                                ? "text-[#d4a647]"
                                : isSoviet
                                ? "text-[#fca5a5]"
                                : "text-amber-300"
                            )}
                          >
                            <div className="w-3.5 h-3.5">
                              <PixelIcons.HOTEL />
                            </div>{" "}
                            {isNoir
                              ? "Штаб 🏛"
                              : isSoviet
                              ? "Комплекс «МИР» ★"
                              : "Отель 🏨"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: tile.houses }).map((_, i) => (
                              <div key={i} className="w-3 h-3">
                                <PixelIcons.HOUSE />
                              </div>
                            ))}
                            <span className="text-xs font-bold ml-1">
                              ({tile.houses}/4)
                            </span>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-[#94a3b8]">
                          {isNoir
                            ? "Территория"
                            : isSoviet
                            ? "Базовый сектор"
                            : "Без построек"}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {tile.housePrice && (
                        <button
                          className={cn(
                            "h-6 text-[10px] px-2 rounded-none font-bold transition-all",
                            buildVal.allowed
                              ? isNoir
                                ? "noir-btn-amber font-noir-title"
                                : isSoviet
                                ? "soviet-btn-cyan font-soviet"
                                : "classic-btn-primary font-sans"
                              : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                          )}
                          onClick={() => buildHouse(tile.id)}
                          disabled={!buildVal.allowed}
                          title={buildVal.reason}
                        >
                          <Plus className="w-2.5 h-2.5 inline mr-0.5" />
                          {isNoir
                            ? tile.houses === 4
                              ? "+ШТАБ"
                              : "+ЯВКА"
                            : isSoviet
                            ? tile.houses === 4
                              ? "+МИР"
                              : "+Модуль"
                            : tile.houses === 4
                            ? "+Отель"
                            : "+Дом"}{" "}
                          (
                          {isNoir
                            ? `$${buildVal.cost}`
                            : isSoviet
                            ? `${buildVal.cost} кР`
                            : `$${buildVal.cost}`}
                          )
                        </button>
                      )}

                      {tile.housePrice && (
                        <button
                          className={cn(
                            "h-6 text-[10px] px-2 rounded-none font-bold transition-all",
                            sellVal.allowed
                              ? isNoir
                                ? "noir-btn-blood font-noir-title"
                                : isSoviet
                                ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626] font-soviet"
                                : "classic-btn-danger font-sans"
                              : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                          )}
                          onClick={() => sellHouse(tile.id)}
                          disabled={!sellVal.allowed}
                          title={sellVal.reason}
                        >
                          <Minus className="w-2.5 h-2.5 inline mr-0.5" />
                          {isNoir
                            ? `-ЯВКА (+$${sellVal.refund})`
                            : isSoviet
                            ? `Снос (+${sellVal.refund} кР)`
                            : `Снести (+$${sellVal.refund})`}
                        </button>
                      )}

                      {tile.isMortgaged ? (
                        <button
                          className={cn(
                            "h-6 text-[10px] px-2 rounded-none font-bold transition-all",
                            unmortgageVal.allowed
                              ? isNoir
                                ? "noir-btn-amber font-noir-title"
                                : isSoviet
                                ? "soviet-btn-cyan font-soviet"
                                : "classic-btn-primary font-sans"
                              : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                          )}
                          onClick={() => unmortgageProperty(tile.id)}
                          disabled={!unmortgageVal.allowed}
                          title={unmortgageVal.reason}
                        >
                          <Unlock className="w-2.5 h-2.5 inline mr-0.5" />
                          {isNoir
                            ? `ВЫКУП ($${unmortgageVal.cost})`
                            : isSoviet
                            ? `Расконсервация (${unmortgageVal.cost} кР)`
                            : `Выкупить ($${unmortgageVal.cost})`}
                        </button>
                      ) : (
                        <button
                          className={cn(
                            "h-6 text-[10px] px-2 rounded-none font-bold transition-all",
                            mortgageVal.allowed
                              ? isNoir
                                ? "noir-btn-blood font-noir-title"
                                : isSoviet
                                ? "soviet-btn-steel text-[#fca5a5] border-[#dc2626] font-soviet"
                                : "classic-btn-danger font-sans"
                              : "opacity-40 cursor-not-allowed bg-slate-800/60 border border-slate-700 text-slate-400"
                          )}
                          onClick={() => mortgageProperty(tile.id)}
                          disabled={!mortgageVal.allowed}
                          title={mortgageVal.reason}
                        >
                          <Landmark className="w-2.5 h-2.5 inline mr-0.5" />
                          {isNoir
                            ? `ЗАЛОЖИТЬ (+$${mortgageVal.value})`
                            : isSoviet
                            ? `В резерв (+${mortgageVal.value} кР)`
                            : `Заложить (+$${mortgageVal.value})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Reason Warning if build is not allowed on property */}
                  {tile.housePrice && !buildVal.allowed && buildVal.reason && (
                    <div className="pt-0.5 flex items-center gap-1 text-[10px] text-amber-400/90 font-medium leading-tight">
                      <span>⚠️</span>
                      <span>{buildVal.reason}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter
          className={cn(
            "pt-2 border-t",
            isNoir
              ? "border-[#d4a647]/30"
              : isSoviet
              ? "border-[#38bdf8]/30"
              : "border-slate-500/30"
          )}
        >
          <button
            className={cn(
              "w-full h-8 text-xs rounded-none font-bold",
              isNoir
                ? "noir-btn-smoke font-noir-title"
                : isSoviet
                ? "soviet-btn-steel font-soviet"
                : "classic-btn-secondary font-sans"
            )}
            onClick={closeModal}
          >
            {isNoir ? "ЗАКРЫТЬ КАРТОТЕКУ" : isSoviet ? "ЗАКРЫТЬ РЕЕСТР ★" : "ЗАКРЫТЬ"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
