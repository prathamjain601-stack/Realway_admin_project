import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Loader2, Minimize2 } from 'lucide-react';
import { useSocketStore } from '../../store/useSocketStore';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

interface ChatMsg {
  id: number;
  senderId: number;
  message: string;
  createdAt: string;
  sender?: { id: number; email: string; firstName: string; lastName: string; role: string } | null;
}

const AdminChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socketMessages = useSocketStore((s) => s.chatMessages);
  const unreadChat = useSocketStore((s) => s.unreadChat);
  const clearUnread = useSocketStore((s) => s.clearUnreadChat);
  const user = useAuthStore((s) => s.user);

  // Fetch chat history on open
  useEffect(() => {
    if (isOpen) {
      clearUnread();
      setLoadingHistory(true);
      api.get('/chat/history?limit=50')
        .then(({ data }) => setHistory(data))
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [isOpen]);

  // Combine fetched history + live socket messages, deduplicate by id
  const allMessages = React.useMemo(() => {
    const merged = [...history];
    for (const sm of socketMessages) {
      if (!merged.find((m) => m.id === sm.id)) {
        merged.push(sm);
      }
    }
    return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [history, socketMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await api.post('/chat/send', { message: message.trim() });
      setMessage('');
    } catch {
      // Message not sent
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSenderName = (msg: ChatMsg) => {
    if (msg.sender) {
      const name = `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim();
      return name || msg.sender.email;
    }
    return 'Unknown';
  };

  const isOwnMessage = (msg: ChatMsg) => msg.senderId === user?.id;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        >
          <MessageCircle size={24} />
          {unreadChat > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadChat > 9 ? '9+' : unreadChat}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] bg-dark-card border border-dark-border rounded-2xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border bg-dark-bg/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-500/20 rounded-full flex items-center justify-center">
                <MessageCircle size={18} className="text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Admin Chat</h3>
                <p className="text-[11px] text-gray-500">Team communication</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-dark-border/50 text-gray-400 hover:text-white transition-colors"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-dark-border/50 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-primary-500" />
              </div>
            ) : allMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MessageCircle size={32} className="opacity-20 mb-2" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            ) : (
              allMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwnMessage(msg) ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isOwnMessage(msg)
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-dark-bg/60 text-gray-200 border border-dark-border rounded-bl-md'
                    }`}
                  >
                    {!isOwnMessage(msg) && (
                      <p className="text-[10px] font-semibold text-primary-400 mb-0.5">
                        {getSenderName(msg)}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-dark-border bg-dark-bg/30">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminChat;
