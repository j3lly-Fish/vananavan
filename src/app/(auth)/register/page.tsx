
import Link from "next/link"
import { signup } from "../login/actions"
import { Bus, User } from "lucide-react"

export default function RegisterPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Join VanaNavan today
                    </p>
                </div>
                <form className="mt-8 space-y-6" action={signup}>
                    {/* Role Selection - Simple Radio for now, but styled */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <input type="radio" name="role" id="role-parent" value="parent" className="peer hidden" defaultChecked />
                            <label htmlFor="role-parent" className="flex flex-col items-center justify-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:border-slate-700 dark:peer-checked:bg-blue-900/20 transition-all">
                                <User className="w-8 h-8 mb-2 text-slate-600 peer-checked:text-blue-600 dark:text-slate-400" />
                                <span className="font-semibold text-slate-900 dark:text-white">Parent</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="role" id="role-driver" value="driver" className="peer hidden" />
                            <label htmlFor="role-driver" className="flex flex-col items-center justify-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:border-slate-700 dark:peer-checked:bg-blue-900/20 transition-all">
                                <Bus className="w-8 h-8 mb-2 text-slate-600 peer-checked:text-blue-600 dark:text-slate-400" />
                                <span className="font-semibold text-slate-900 dark:text-white">Driver</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="sr-only">First Name</label>
                            <input id="firstName" name="firstName" type="text" required className="relative block w-full rounded-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder="First Name" />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">Last Name</label>
                            <input id="lastName" name="lastName" type="text" required className="relative block w-full rounded-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder="Last Name" />
                        </div>
                    </div>

                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required className="relative block w-full rounded-t-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder="Email address" />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input id="password" name="password" type="password" autoComplete="new-password" required className="relative block w-full rounded-b-md border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700" placeholder="Password" />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all shadow-lg shadow-blue-500/30">
                            Sign up
                        </button>
                    </div>
                    <div className="text-sm text-center">
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
