'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = 2;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setOpen(!open)}
            >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border border-white dark:border-slate-950"></span>
                )}
            </Button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50">
                    <div className="px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800">
                        Notifications
                    </div>

                    <Link
                        href="/dashboard/messages"
                        className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/50"
                        onClick={() => setOpen(false)}
                    >
                        <div className="font-medium text-sm text-slate-800 dark:text-slate-200">New Message</div>
                        <div className="text-xs text-slate-500 mt-0.5">Parent sent you a message about route...</div>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/50"
                        onClick={() => setOpen(false)}
                    >
                        <div className="font-medium text-sm text-slate-800 dark:text-slate-200">New Route Match</div>
                        <div className="text-xs text-slate-500 mt-0.5">Student nearby matches your Morning Route</div>
                    </Link>

                    <button className="w-full text-center py-2 text-xs text-[#C85A6E] hover:text-[#B54A5E] font-medium">
                        Mark all as read
                    </button>
                </div>
            )}
        </div>
    );
}
