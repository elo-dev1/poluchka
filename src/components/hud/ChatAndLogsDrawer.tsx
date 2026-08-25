import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ScrollText, Send, ChevronUp, ChevronDown, Lock } from 'lucide-react';

export const ChatAndLogsDrawer: React.FC = () => {
  const { gameState, chatMessages, sendChatMessage, playerId, currentUser, openModal } = useGame();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'chat'>('logs');
  const [chatInput, setChatInput] = useState<string>('');
  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const logs = gameState?.logs || [];

  useEffect(() => {
    if (activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, chatMessages.length, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  return (
    <div
      className={`fixed bottom-2 right-2 sm:bottom-3 sm:right-3 w-72 sm:w-80 md:w-96 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-2xl z-30 transition-all duration-300 flex flex-col overflow-hidden ${
        isOpen ? 'h-64 sm:h-72 md:h-80' : 'h-11'
      }`}
    >
      {/* Header / Toggle Bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto" onClick={(e) => e.stopPropagation()}>
          <TabsList className="h-7 p-0.5 bg-black/40">
            <TabsTrigger value="logs" className="h-6 text-[11px] px-2.5 flex items-center gap-1">
              <ScrollText className="w-3 h-3" />
              Журнал ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="chat" className="h-6 text-[11px] px-2.5 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-blue-400" />
              Чат {chatMessages.length > 0 && `(${chatMessages.length})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <button className="text-muted-foreground hover:text-foreground p-1">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Content Area */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 text-xs">
          {/* Logs View */}
          {activeTab === 'logs' ? (
            <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 font-mono text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <span className="text-muted-foreground text-center py-4">Журнал партии пуст</span>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className={`flex items-start gap-1.5 p-1 rounded ${
                      log.type === 'action' || log.type === 'dice'
                        ? 'text-blue-300'
                        : log.type === 'purchase' || log.type === 'property' || log.type === 'build'
                        ? 'text-emerald-300'
                        : log.type === 'rent' || log.type === 'money'
                        ? 'text-amber-300'
                        : log.type === 'jail' || log.type === 'danger' || log.type === 'tax'
                        ? 'text-red-300'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="shrink-0">{log.icon || '•'}</span>
                    <span>{log.text || log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          ) : (
            /* Chat View */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
                {chatMessages.length === 0 ? (
                  <span className="text-muted-foreground text-center py-4">В чате пока нет сообщений</span>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isMyMsg = msg.playerId === playerId;
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col text-[11px] p-2 rounded-xl max-w-[85%] ${
                          isMyMsg
                            ? 'bg-primary/25 border border-primary/40 self-end text-right'
                            : 'bg-white/10 border border-white/5 self-start text-left'
                        }`}
                      >
                        <span
                          className="font-bold text-[10px] mb-0.5"
                          style={{ color: msg.senderColor || '#60a5fa' }}
                        >
                          {msg.senderName || 'Игрок'}:
                        </span>
                        <span className="text-foreground leading-snug break-words">
                          {msg.message}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input or Locked Guest Notice */}
              {currentUser ? (
                <form onSubmit={handleSend} className="p-2 border-t border-white/10 flex gap-1.5 bg-black/40">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Написать в чат..."
                    className="h-8 text-xs bg-black/40 border-white/10"
                  />
                  <Button type="submit" size="sm" variant="default" className="h-8 px-2.5">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              ) : (
                <div className="p-2 border-t border-white/10 flex items-center justify-between gap-2 bg-black/40">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Чат только для авторизованных</span>
                  </div>
                  <Button
                    size="sm"
                    variant="gold"
                    className="h-7 text-[10px] font-bold px-2.5"
                    onClick={() => openModal('telegramLogin')}
                  >
                    Войти
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
