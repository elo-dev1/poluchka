import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Flag, AlertTriangle, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SurrenderModal: React.FC = () => {
  const { activeModal, closeModal, declareBankruptcy, theme } = useGame();
  const isOpen = activeModal === 'surrender';
  const isSoviet = theme === 'soviet';
  const isNoir = theme === 'noir';

  const handleConfirmSurrender = () => {
    declareBankruptcy();
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className={cn(
        "max-w-md p-5 select-none shadow-2xl rounded-none border",
        isNoir ? "noir-panel text-[#f5e6c8] border-[#8b0000] font-noir-body" : isSoviet ? "soviet-steel-panel text-[#e2e8f0] border-[#dc2626] font-soviet" : "classic-panel text-white border-red-500/50 font-sans"
      )}>
        <DialogHeader className="border-b border-red-500/30 pb-3 flex flex-col items-center text-center">
          <div className={cn("w-12 h-12 rounded-none flex items-center justify-center mb-1", isNoir ? "bg-[#1a1410] border border-[#8b0000]" : "bg-[#260a0e] border border-[#dc2626]")}>
            <Flag className="w-6 h-6 text-[#ef4444]" />
          </div>
          <DialogTitle className={cn("text-base sm:text-lg font-bold text-[#ef4444]", isNoir ? "font-noir-title" : "")}>
            {isNoir ? 'ЗАКРЫТЬ ДЕЛО (СДАТЬСЯ)' : isSoviet ? 'АВАРИЙНЫЙ СХОД С ОРБИТЫ (ПРЕРЫВАНИЕ)' : 'СДАТЬСЯ / ОБЪЯВИТЬ БАНКРОТСТВО'}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#fca5a5] mt-0.5">
            {isNoir
              ? 'Вы уверены, что хотите закрыть дело и покинуть город?'
              : isSoviet
              ? 'Официальное прекращение исследовательской миссии перед Госкомиссией СССР'
              : 'Вы уверены, что хотите сдаться и покинуть текущую игру?'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 py-3 text-xs leading-relaxed">
          <div className="p-3 rounded-none bg-[#260a0e]/80 border border-[#dc2626]/40 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[#ef4444]">
                {isNoir ? 'ПОСЛЕДСТВИЯ ЗАКРЫТИЯ ДЕЛА:' : isSoviet ? 'ПОСЛЕДСТВИЯ ПРЕРЫВАНИЯ МИССИИ:' : 'ПОСЛЕДСТВИЯ СДАЧИ:'}
              </span>
              <ul className="list-disc list-inside text-slate-200 flex flex-col gap-0.5 text-xs">
                {isNoir ? (
                  <>
                    <li>Все ваши территории и улики перейдут в архив</li>
                    <li>Вы выбываете из текущего расследования</li>
                    <li>Дело продолжится между оставшимися детективами</li>
                  </>
                ) : isSoviet ? (
                  <>
                    <li>Все подконтрольные сектора и станции переходят в фонд Академии Наук СССР</li>
                    <li>Экипаж завершает сеанс связи и эвакуируется в резервную капсулу</li>
                    <li>Исследование орбиты продолжается оставшимися экипажами</li>
                  </>
                ) : (
                  <>
                    <li>Все ваши активы и средства перейдут в Банк</li>
                    <li>Вы выбываете из текущей партии</li>
                    <li>Игра продолжится между оставшимися участниками</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-red-500/20">
          <button
            className={cn("w-full sm:flex-1 h-8 rounded-none text-xs font-bold", isNoir ? "noir-btn-smoke font-noir-title" : isSoviet ? "soviet-btn-steel font-soviet" : "classic-btn-secondary font-sans")}
            onClick={closeModal}
          >
            {isNoir ? "ВЕРНУТЬСЯ К ДЕЛУ" : isSoviet ? "ОТМЕНА (ПРОДОЛЖИТЬ)" : "ОТМЕНА (ПРОДОЛЖИТЬ ИГРУ)"}
          </button>
          <button
            className={cn("w-full sm:flex-1 h-8 rounded-none text-xs font-bold flex items-center justify-center gap-1.5", isNoir ? "noir-btn-blood font-noir-title" : isSoviet ? "soviet-btn-red font-soviet" : "classic-btn-danger font-sans")}
            onClick={handleConfirmSurrender}
          >
            <ShieldX className="w-4 h-4" />
            <span>{isNoir ? "ЗАКРЫТЬ ДЕЛО 🚩" : isSoviet ? "СХОД С ОРБИТЫ ★" : "СДАТЬСЯ 🚩"}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
