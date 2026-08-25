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
import { Button } from '@/components/ui/button';
import { Flag, AlertTriangle, ShieldX } from 'lucide-react';

export const SurrenderModal: React.FC = () => {
  const { activeModal, closeModal, declareBankruptcy } = useGame();
  const isOpen = activeModal === 'surrender';

  const handleConfirmSurrender = () => {
    declareBankruptcy();
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md p-5 bg-[#0f1326] border-red-500/30 text-foreground select-none shadow-2xl">
        <DialogHeader className="border-b border-white/10 pb-3 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <Flag className="w-6 h-6 text-red-400" />
          </div>
          <DialogTitle className="text-base sm:text-lg font-black text-white">
            Признать поражение?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Вы собираетесь добровольно сдаться и объявить банкротство
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 py-3 text-xs leading-relaxed text-slate-300">
          <div className="p-3 rounded-xl bg-red-950/25 border border-red-500/20 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-red-200">Последствия капитуляции:</span>
              <ul className="list-disc list-inside text-red-200/80 flex flex-col gap-0.5 text-[11px]">
                <li>Все ваши улицы и имущество перейдут банку</li>
                <li>Вы выбываете из текущей партии за столом</li>
                <li>Матч продолжится среди оставшихся игроков</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full sm:flex-1 h-9 rounded-xl font-bold text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={closeModal}
          >
            Отмена (Играть дальше)
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:flex-1 h-9 rounded-xl font-black text-xs bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
            onClick={handleConfirmSurrender}
          >
            <ShieldX className="w-4 h-4" />
            <span>Да, сдаться</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
