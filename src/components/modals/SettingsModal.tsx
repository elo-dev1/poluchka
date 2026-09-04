import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { THEMES } from '@/lib/constants';
import { Sliders, Snowflake, Gauge, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    theme,
    snowEnabled,
    animSpeed,
    applySettings,
    currentUser,
    openModal,
    showToast,
  } = useGame();

  const isOpen = activeModal === 'settings';

  const [draftTheme, setDraftTheme] = useState(theme);
  const [draftSnow, setDraftSnow] = useState(snowEnabled);
  const [draftSpeed, setDraftSpeed] = useState(animSpeed);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraftTheme(theme);
      setDraftSnow(snowEnabled);
      setDraftSpeed(animSpeed);
    }
  }, [isOpen, theme, snowEnabled, animSpeed]);

  const handleSave = () => {
    applySettings({
      theme: draftTheme,
      snow: draftSnow,
      speed: draftSpeed,
    });
    closeModal();
  };

  const isUserAuthed = Boolean(
    currentUser || (typeof window !== 'undefined' && localStorage.getItem('monopoly_tg_user'))
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-[#0f1326] border-white/15 text-foreground select-none p-5">
        <DialogHeader className="border-b border-white/10 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-black">
            <Sliders className="w-5 h-5 text-primary" />
            Настройки графики и темы
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">

          {/* 2. Theme Picker */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Тема оформления
              </span>
              {!isUserAuthed && (
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Советская тема требует входа
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => {
                const isLocked = Boolean(t.authOnly && !isUserAuthed);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isLocked) {
                        showToast(`Тема «${t.name}» доступна только авторизованным игрокам!`, 'warning');
                        openModal('telegramLogin');
                        return;
                      }
                      setDraftTheme(t.id);
                    }}
                    className={cn(
                      'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative overflow-hidden',
                      draftTheme === t.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : isLocked
                        ? 'border-white/5 bg-black/40 opacity-75 hover:opacity-100 hover:border-amber-500/40'
                        : 'border-white/10 bg-black/20 hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                        <span className="text-xs font-bold text-foreground truncate">{t.name}</span>
                      </div>
                      {isLocked && (
                        <span className="shrink-0 ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded flex items-center gap-0.5 border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5" /> Вход
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Animation Speed Slider (Left = Slow, Right = Fast) */}
          <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-400" />
                Скорость шага фишек
              </span>
              <span className="text-xs font-bold text-primary">
                {draftSpeed === 1
                  ? '🐢 Медленно'
                  : draftSpeed === 2
                  ? '🚶 Плавная'
                  : draftSpeed === 3
                  ? '⚡ Обычная'
                  : draftSpeed === 4
                  ? '🚀 Быстрая'
                  : '🏎️ Турбо'}
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[draftSpeed <= 5 ? draftSpeed : (draftSpeed <= 100 ? 5 : draftSpeed <= 180 ? 4 : 2)]}
              onValueChange={(val) => setDraftSpeed(val[0])}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold px-0.5">
              <span>🐢 Медленно</span>
              <span>Обычная</span>
              <span>Быстро ⚡</span>
            </div>
          </div>

          {/* 4. Falling Snow Effect */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
            <div className="flex flex-col">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-400" />
                Эффект падающего снега
              </span>
              <span className="text-xs text-muted-foreground">Праздничные новогодние частицы</span>
            </div>
            <Switch checked={draftSnow} onCheckedChange={setDraftSnow} />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-white/10">
          <Button variant="default" className="w-full text-xs sm:text-sm font-black h-9 rounded-xl" onClick={handleSave}>
            Применить настройки
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
