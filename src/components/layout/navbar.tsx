'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bus, Menu } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown';

export function Navbar({ user: initialUser }: { user?: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user || initialUser;

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-md dark:bg-slate-950/70 transition-all">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
                        <Bus className="h-6 w-6 text-white" />
                    </div>
                    <span>VanaNavan</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Common Links (Visible to all? Or just public?) */}
                    {/* If logged in as driver, "Find Drivers" might not make sense, but keeping for now */}
                    {!user && (
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                            Find Drivers
                        </Link>
                    )}

                    <div className="flex items-center gap-4 ml-4">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                                    Dashboard
                                </Link>
                                <NotificationsDropdown />
                                <Button
                                    variant="ghost"
                                    className="text-sm text-slate-600 dark:text-slate-300"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800 transition-all">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5">
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-slate-600 dark:text-slate-300"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu />
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 shadow-xl">
                    <div className="flex flex-col space-y-4">
                        <Link href="/dashboard" className="text-base font-medium text-slate-600">Find Drivers</Link>
                        <Link href="#" className="text-base font-medium text-slate-600">How it Works</Link>
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-base font-medium text-slate-600">Dashboard</Link>
                                <Link href="/dashboard/messages" className="text-base font-medium text-slate-600">Messages</Link>
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-base font-medium text-red-600 text-left">Sign Out</button>
                            </>
                        ) : (
                            <Link href="/login" className="text-base font-medium text-blue-600">Sign In</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
