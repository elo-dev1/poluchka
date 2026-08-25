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
import { Sliders, Snowflake, Sparkles, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    theme,
    is3D,
    tiltX,
    rotZ,
    snowEnabled,
    animSpeed,
    applySettings,
  } = useGame();

  const isOpen = activeModal === 'settings';

  const [draftTheme, setDraftTheme] = useState(theme);
  const [draft3D, setDraft3D] = useState(is3D);
  const [draftTiltX, setDraftTiltX] = useState(tiltX);
  const [draftRotZ, setDraftRotZ] = useState(rotZ);
  const [draftSnow, setDraftSnow] = useState(snowEnabled);
  const [draftSpeed, setDraftSpeed] = useState(animSpeed);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraftTheme(theme);
      setDraft3D(is3D);
      setDraftTiltX(tiltX);
      setDraftRotZ(rotZ);
      setDraftSnow(snowEnabled);
      setDraftSpeed(animSpeed);
    }
  }, [isOpen, theme, is3D, tiltX, rotZ, snowEnabled, animSpeed]);

  const handleSave = () => {
    applySettings({
      theme: draftTheme,
      is3D: draft3D,
      tiltX: draftTiltX,
      rotZ: draftRotZ,
      snow: draftSnow,
      speed: draftSpeed,
    });
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-[#0f1326] border-white/15 text-foreground select-none p-5">
        <DialogHeader className="border-b border-white/10 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-black">
            <Sliders className="w-5 h-5 text-primary" />
            Настройки графики и вида
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* 1. 3D Isometric View */}
          <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  3D Изометрический вид
                </span>
                <span className="text-xs text-muted-foreground">Объёмная перспектива и наклон поля</span>
              </div>
              <Switch checked={draft3D} onCheckedChange={setDraft3D} />
            </div>

            {draft3D && (
              <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Наклон по X:</span>
                    <span className="text-foreground font-bold">{draftTiltX}°</span>
                  </div>
                  <Slider
                    min={20}
                    max={65}
                    step={1}
                    value={[draftTiltX]}
                    onValueChange={(val) => setDraftTiltX(val[0])}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Вращение по Z:</span>
                    <span className="text-foreground font-bold">{draftRotZ}°</span>
                  </div>
                  <Slider
                    min={-45}
                    max={45}
                    step={1}
                    value={[draftRotZ]}
                    onValueChange={(val) => setDraftRotZ(val[0])}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Theme Picker */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Тема оформления
            </span>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDraftTheme(t.id)}
                  className={cn(
                    'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all',
                    draftTheme === t.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                      : 'border-white/10 bg-black/20 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primary }} />
                    <span className="text-xs font-bold text-foreground">{t.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                </button>
              ))}
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
