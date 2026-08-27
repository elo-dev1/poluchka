import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck, ArrowLeft } from 'lucide-react';

export const LegalModal: React.FC = () => {
  const { activeModal, modalData, closeModal, openModal } = useGame();
  const isOpen = activeModal === 'legal';
  const defaultTab = modalData?.tab === 'privacy' ? 'privacy' : 'terms';

  const handleClose = () => {
    if (modalData?.returnTo) {
      openModal(modalData.returnTo);
    } else {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="terms" className="flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5" />
                Пользовательское соглашение
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Конфиденциальность (152-ФЗ)
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[50vh] pr-2 mt-4 text-xs leading-relaxed text-muted-foreground text-left flex flex-col gap-3">
              {/* Terms Tab */}
              <TabsContent value="terms" className="flex flex-col gap-3 mt-0">
                <h4 className="text-sm font-bold text-foreground">Пользовательское соглашение (Публичная оферта)</h4>
                <p>Настоящее соглашение регулирует порядок использования браузерной игры «Получка» (далее — «Сервис»).</p>

                <h5 className="font-bold text-foreground mt-1">1. Статус Сервиса и развлекательный характер</h5>
                <p>1.1. Сервис является бесплатной браузерной игрой, созданной исключительно в развлекательных целях для организации досуга.</p>
                <p>1.2. <strong>Игровая валюта и баланс:</strong> Все денежные единицы (доллары, балансы, стоимость улиц), используемые в игре, являются виртуальными очками. Они не имеют реальной денежной стоимости, не являются электронными деньгами, не подлежат выводу или обналичиванию в соответствии с 244-ФЗ РФ.</p>

                <h5 className="font-bold text-foreground mt-1">2. Авторизация и аккаунты</h5>
                <p>2.1. Игрок может использовать сервис в гостевом режиме либо пройти авторизацию через официальные сервисы <strong>Telegram</strong> или <strong>Яндекс ID</strong> (в соответствии с требованиями 406-ФЗ РФ) для сохранения ELO-рейтинга, статистики и участия в таблице лидеров.</p>
                <p>2.2. Авторизация осуществляется через безопасные протоколы OAuth / Telegram Login Widget без передачи паролей третьей стороне.</p>
                <p>2.3. Запрещено использование нецензурной лексики, оскорбительных выражений и запрещённых материалов в отображаемых именах и аватарах.</p>

                <h5 className="font-bold text-foreground mt-1">3. Правила поведения и модерация</h5>
                <p>3.1. В игровом чате запрещены оскорбления, спам, ненормативная лексика и распространение вредоносных ссылок.</p>
                <p>3.2. Запрещено использование ботов, скриптов автоматизации для искусственной накрутки рейтинга или умышленного срыва игровых матчей.</p>

                <h5 className="font-bold text-foreground mt-1">4. Ограничение ответственности</h5>
                <p>4.1. Сервис предоставляется на условиях «как есть» (<em>as is</em>). Администрация не гарантирует бесперебойную работу в случае проблем с интернет-соединением на стороне пользователя или сбоев внешних провайдеров.</p>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="flex flex-col gap-3 mt-0">
                <h4 className="text-sm font-bold text-foreground">Политика обработки персональных данных (152-ФЗ)</h4>
                <p>Настоящая Политика определяет порядок обработки и защиты персональной информации пользователей в соответствии с Федеральным законом № 152-ФЗ РФ «О персональных данных».</p>

                <h5 className="font-bold text-foreground mt-1">1. Состав обрабатываемых данных</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>При авторизации через Telegram:</strong> идентификатор Telegram (Telegram ID), имя и фамилия (first_name, last_name), имя пользователя (username), ссылка на аватар профиля (photo_url);
                  </li>
                  <li>
                    <strong>При авторизации через Яндекс ID:</strong> идентификатор аккаунта Яндекс (Yandex ID), отображаемое имя (display_name / first_name, last_name), логин, ссылка на аватар (avatars.yandex.net);
                  </li>
                  <li>
                    <strong>Игровая статистика:</strong> сыгранные партии, победы, винрейт, текущий ELO-рейтинг, история ходов и матчей;
                  </li>
                  <li>
                    <strong>Технические данные подключения:</strong> IP-адрес, данные WebSocket-сессии, идентификаторы локального хранилища (localStorage/cookie) для поддержания авторизации.
                  </li>
                </ul>

                <h5 className="font-bold text-foreground mt-1">2. Цели обработки данных</h5>
                <p>2.1. Идентификация игрока, сохранение игрового прогресса, персональной статистики и достижений.</p>
                <p>2.2. Расчет ELO-рейтинга и формирование публичной таблицы лидеров.</p>
                <p>2.3. Обеспечение стабильности игровых комнат, синхронизация игрового процесса и защита от читерства.</p>

                <h5 className="font-bold text-foreground mt-1">3. Защита и уничтожение данных</h5>
                <p>3.1. Данные не передаются третьим лицам и защищены серверными криптографическими алгоритмами HMAC-SHA256 и безопасными токенами авторизации.</p>
                <p>3.2. Пользователь имеет право в любой момент выйти из аккаунта на устройстве и обратиться к Администрации для полного удаления своего профиля и статистики.</p>
              </TabsContent>
            </div>
          </Tabs>
        </DialogHeader>

        <DialogFooter className="mt-2 pt-2 border-t border-white/10">
          <Button variant="default" className="w-full flex items-center justify-center gap-2" onClick={handleClose}>
            {modalData?.returnTo && <ArrowLeft className="w-4 h-4" />}
            Понятно / Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
