'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { MessageSquare } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getConversations, getMessages, getProfile } from './actions';
import { useSession } from 'next-auth/react';

type Conversation = {
    partner_id: string;
    partner_name: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
};

export default function MessagesPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const initialPartnerId = searchParams.get('partnerId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
    const [initialMessages, setInitialMessages] = useState<any[]>([]);

    useEffect(() => {
        async function init() {
            if (session?.user?.id) {
                const convs = await getConversations();
                setConversations(convs);

                // Handle direct link to chat
                if (initialPartnerId) {
                    setSelectedPartnerId(initialPartnerId);
                    const msgs = await getMessages(initialPartnerId);
                    setInitialMessages(msgs);

                    // If not in updated conversations list, add a placeholder so it shows up
                    const exists = convs.find(c => c.partner_id === initialPartnerId);
                    if (!exists) {
                        const profile = await getProfile(initialPartnerId);
                        if (profile) {
                            const newConv: Conversation = {
                                partner_id: profile.id,
                                partner_name: `${profile.firstName} ${profile.lastName}`,
                                last_message: '',
                                last_message_time: new Date().toISOString(),
                                unread_count: 0
                            };
                            setConversations(prev => [newConv, ...prev]);
                        }
                    }
                }
            }
        }
        init();
    }, [session, initialPartnerId]);

    const handleSelect = async (partnerId: string) => {
        setSelectedPartnerId(partnerId);
        const msgs = await getMessages(partnerId);
        setInitialMessages(msgs);
    };

    const selectedConversation = conversations.find(c => c.partner_id === selectedPartnerId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Conversation List */}
            <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="font-bold text-lg">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <p>No conversations yet.</p>
                        </div>
                    ) : (
                        conversations.map((c) => (
                            <div
                                key={c.partner_id}
                                onClick={() => handleSelect(c.partner_id)}
                                className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedPartnerId === c.partner_id ? 'bg-[#D4A574]/10 dark:bg-[#D4A574]/20' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold text-slate-900 dark:text-white">{c.partner_name}</span>
                                    <span className="text-xs text-slate-500">{new Date(c.last_message_time).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{c.last_message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="md:col-span-2">
                {selectedPartnerId && session?.user?.id && selectedConversation ? (
                    <ChatInterface
                        key={selectedPartnerId} // Re-render on change
                        currentUserId={session.user.id}
                        partnerId={selectedPartnerId}
                        partnerName={selectedConversation.partner_name}
                        initialMessages={initialMessages}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
