import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        redirect("/login");
    }

    // Role is attached to session in auth.ts callbacks
    // @ts-ignore
    const role = user.role;

    if (role === "admin") redirect("/admin");
    if (role === "driver") redirect("/dashboard/driver");
    if (role === "parent") redirect("/dashboard/parent");

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-slate-500">Redirecting to your dashboard...</p>
        </div>
    );
}
