import { db } from "@/db";
import { profiles, messages } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { toggleUserStatus } from "./actions";
import { desc, sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    // Fetch stats
    const allProfiles = await db.select().from(profiles).orderBy(desc(profiles.createdAt));
    const messageCountRes = await db.select({ count: sql<number>`count(*)` }).from(messages);
    const messageCount = messageCountRes[0].count;

    const drivers = allProfiles.filter(p => p.role === 'driver');
    const parents = allProfiles.filter(p => p.role === 'parent');

    return (
        <div className="container mx-auto py-10 space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500">Total Drivers</h3>
                    <p className="text-3xl font-bold mt-2">{drivers.length}</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500">Total Parents</h3>
                    <p className="text-3xl font-bold mt-2">{parents.length}</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500">Total Exchange Messages</h3>
                    <p className="text-3xl font-bold mt-2">{messageCount}</p>
                </div>
            </div>

            {/* User Management */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">License</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {allProfiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{profile.firstName} {profile.lastName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${profile.role === 'driver' ? 'bg-[#D4A574]/15 text-[#D4A574] dark:bg-[#D4A574]/25 dark:text-[#D4A574]' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                            {profile.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{profile.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${profile.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {profile.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {profile.role === 'driver' && (
                                            profile.licenseDocumentUrl ? (
                                                <a href={profile.licenseDocumentUrl} target="_blank" className="text-[#C85A6E] hover:underline">View</a>
                                            ) : <span className="text-slate-400">Missing</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={toggleUserStatus}>
                                            <input type="hidden" name="userId" value={profile.id} />
                                            <input type="hidden" name="currentStatus" value={String(profile.isActive)} />
                                            {profile.isActive ? (
                                                <Button variant="destructive" size="sm">Deactivate</Button>
                                            ) : (
                                                <Button variant="default" size="sm">Activate</Button>
                                            )}
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
