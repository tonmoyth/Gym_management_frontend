'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Send, User as UserIcon } from 'lucide-react';
import { ChatMessage } from '@/types/api.types';
import { chatApi } from '@/lib/api/chat.api';

export interface ChatWindowProps {
  threadId?: string;
  recipientName?: string;
  recipientRole?: string;
  currentUserId?: string;
  title?: string;
  placeholder?: string;
}

export function ChatWindow({
  threadId = 'general-support',
  recipientName,
  recipientRole,
  currentUserId = 'user-me',
  title,
  placeholder = 'Type a message...',
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayName = title || recipientName || 'Support Desk';

  const fetchMessages = async () => {
    try {
      const res = await chatApi.getMessages(threadId);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMessages(res.data.data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // 5 sec interval polling
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const text = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const optimisticMessage: ChatMessage = {
      id: 'opt-' + Date.now(),
      threadId,
      senderId: currentUserId,
      content: text,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await chatApi.sendMessage(threadId, text);
    } catch {
      // Failed to send
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[580px] border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Thread Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {displayName}
            </h4>
            {recipientRole && (
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                {recipientRole}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            Start the conversation with {displayName}
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(m.sentAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newMessage.trim() || isSending}
          className="rounded-2xl px-4 py-2.5"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
