'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { sendMessage, getMessages } from '@/app/dashboard/messages/actions';

type Message = {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: string | Date;
    isRead: boolean | null;
};

type ChatInterfaceProps = {
    currentUserId: string;
    partnerId: string;
    partnerName: string;
    initialMessages: any[];
};

export function ChatInterface({ currentUserId, partnerId, partnerName, initialMessages }: ChatInterfaceProps) {
    // @ts-ignore
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Polling for new messages every 5 seconds
        const interval = setInterval(async () => {
            const latestMessages = await getMessages(partnerId);
            if (latestMessages) {
                // @ts-ignore
                setMessages(latestMessages);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [partnerId]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        // Optimistic update
        const tempId = Math.random().toString();
        const messageToSend: Message = {
            id: tempId,
            senderId: currentUserId,
            recipientId: partnerId,
            content: newMessage,
            createdAt: new Date().toISOString(),
            isRead: false
        };

        setMessages((prev) => [...prev, messageToSend]);
        setNewMessage('');

        const result = await sendMessage(partnerId, messageToSend.content);

        if (result?.error) {
            toast.error('Failed to send message');
            console.error(result.error);
        } else {
            // Re-fetch to get real ID and timestamp
            const latestMessages = await getMessages(partnerId);
            // @ts-ignore
            if (latestMessages) setMessages(latestMessages);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{partnerName}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[70%] p-3 rounded-2xl text-sm",
                                isMe
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <form
                    className="flex gap-2"
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                >
                    <input
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
