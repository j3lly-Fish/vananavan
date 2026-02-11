'use client';

import Link from "next/link"
import { login } from "./actions"
import { useTranslations } from "@/components/providers/language-provider"

export default function LoginPage() {
    const t = useTranslations('auth');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await login(formData);
    };

    return (
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('login')}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {t('joinToday')}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                {t('email')}
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-t-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#D4A574] sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700"
                                placeholder={t('email')}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#D4A574] sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700"
                                placeholder={t('password')}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-lg bg-[#D4A574] px-3 py-3 text-sm font-semibold text-white hover:bg-[#B89060] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A574] transition-all shadow-lg shadow-[#D4A574]/30"
                        >
                            {t('login')}
                        </button>
                    </div>
                    <div className="text-sm text-center">
                        <Link href="/register" className="font-medium text-[#C85A6E] hover:text-[#B54A5E]">
                            {t('noAccount')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
