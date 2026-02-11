'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown';
import { LanguageToggle } from '@/components/language-toggle';

export function Navbar({ user: initialUser }: { user?: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user || initialUser;

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#2C3E50] transition-all">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/vananavan-icon-resized.png"
                        alt="VanaNavan Logo"
                        width={261}
                        height={80}
                        className="h-14 w-auto object-contain"
                        priority
                    />
                    <span className="font-bold text-xl text-[#FF8C42]">vananavan.com</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {!user && (
                        <Link href="/dashboard" className="text-sm font-medium text-white hover:text-[#FF8C42] transition-colors">
                            Find Drivers
                        </Link>
                    )}

                    <div className="flex items-center gap-4 ml-4">
                        <LanguageToggle userId={user?.id} />
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-white hover:text-[#FF8C42]">
                                    Dashboard
                                </Link>
                                <NotificationsDropdown />
                                <Button
                                    variant="ghost"
                                    className="text-sm text-white hover:text-[#FF8C42]"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <button className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-all">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="px-5 py-2 text-sm font-bold text-white bg-[#FF8C42] rounded-lg hover:bg-[#e67a2e] shadow-lg shadow-[#FF8C42]/20 hover:shadow-[#FF8C42]/40 transition-all transform hover:-translate-y-0.5">
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu />
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-white/10 bg-[#243847] px-4 py-4 shadow-xl">
                    <div className="flex flex-col space-y-4">
                        <div className="pb-2 border-b border-white/10">
                            <LanguageToggle userId={user?.id} />
                        </div>
                        <Link href="/dashboard" className="text-base font-medium text-white">Find Drivers</Link>
                        <Link href="#" className="text-base font-medium text-white">How it Works</Link>
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-base font-medium text-white">Dashboard</Link>
                                <Link href="/dashboard/messages" className="text-base font-medium text-white">Messages</Link>
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-base font-medium text-red-400 text-left">Sign Out</button>
                            </>
                        ) : (
                            <Link href="/login" className="text-base font-medium text-[#FF8C42]">Sign In</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
