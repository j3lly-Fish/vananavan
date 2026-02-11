'use client';

import Link from "next/link"
import { signup } from "../login/actions"
import { Bus, User } from "lucide-react"
import { useState } from "react"
import { TosModal } from "@/components/tos-modal"
import { toast } from "sonner"
import { useTranslations } from "@/components/providers/language-provider"

export default function RegisterPage() {
    const t = useTranslations('auth');
    const tTos = useTranslations('tos');
    const [tosAccepted, setTosAccepted] = useState(false);
    const [showTosModal, setShowTosModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tosAccepted) {
            toast.error(tTos('mustAccept'));
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.append('tosAccepted', 'true');
        await signup(formData);
    };

    return (
        <>
            <TosModal isOpen={showTosModal} onClose={() => setShowTosModal(false)} />
            <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-lg space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t('createAccount')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('joinToday')}
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {/* Role Selection - Simple Radio for now, but styled */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <input type="radio" name="role" id="role-parent" value="parent" className="peer hidden" defaultChecked />
                                <label htmlFor="role-parent" className="flex flex-col items-center justify-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-[#D4A574] peer-checked:border-[#D4A574] peer-checked:bg-[#D4A574]/10 dark:border-slate-700 dark:peer-checked:bg-[#D4A574]/20 transition-all">
                                    <User className="w-8 h-8 mb-2 text-slate-600 peer-checked:text-[#D4A574] dark:text-slate-400" />
                                    <span className="font-semibold text-slate-900 dark:text-white">Parent</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="role" id="role-driver" value="driver" className="peer hidden" />
                                <label htmlFor="role-driver" className="flex flex-col items-center justify-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-[#D4A574] peer-checked:border-[#D4A574] peer-checked:bg-[#D4A574]/10 dark:border-slate-700 dark:peer-checked:bg-[#D4A574]/20 transition-all">
                                    <Bus className="w-8 h-8 mb-2 text-slate-600 peer-checked:text-[#D4A574] dark:text-slate-400" />
                                    <span className="font-semibold text-slate-900 dark:text-white">Driver</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="sr-only">{t('firstName')}</label>
                                <input id="firstName" name="firstName" type="text" required className="relative block w-full rounded-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#D4A574] sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder={t('firstName')} />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="sr-only">{t('lastName')}</label>
                                <input id="lastName" name="lastName" type="text" required className="relative block w-full rounded-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#D4A574] sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder={t('lastName')} />
                            </div>
                        </div>

                        <div className="-space-y-px rounded-md shadow-sm">
                            <div>
                                <label htmlFor="email-address" className="sr-only">{t('email')}</label>
                                <input id="email-address" name="email" type="email" autoComplete="email" required className="relative block w-full rounded-t-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#D4A574] sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder={t('email')} />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">{t('password')}</label>
                                <input id="password" name="password" type="password" autoComplete="new-password" required className="relative block w-full rounded-b-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#D4A574] sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder={t('password')} />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="tos"
                                    name="tos"
                                    type="checkbox"
                                    checked={tosAccepted}
                                    onChange={(e) => setTosAccepted(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#D4A574] focus:ring-[#D4A574] dark:border-slate-700 dark:bg-slate-950"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="tos" className="text-slate-700 dark:text-slate-300">
                                    {tTos('accept').split(' ')[0]} {' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTosModal(true)}
                                        className="font-medium text-[#C85A6E] hover:text-[#B54A5E] hover:underline"
                                    >
                                        {tTos('title')}
                                    </button>
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={!tosAccepted}
                                className="group relative flex w-full justify-center rounded-lg bg-[#D4A574] px-3 py-3 text-sm font-semibold text-white hover:bg-[#B89060] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A574] transition-all shadow-lg shadow-[#D4A574]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#D4A574]"
                            >
                                {t('signup')}
                            </button>
                        </div>
                        <div className="text-sm text-center">
                            <Link href="/login" className="font-medium text-[#C85A6E] hover:text-[#B54A5E]">
                                {t('alreadyHaveAccount')}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
