"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

export default function Navbar() {
    const router = useRouter();
    const user = getUser();

    if (!user) return null;

    const dashboardPath = user.role === "senior" ? "/senior" : "/guardian";

    return (
        <nav className="navbar">
            <Link href={dashboardPath} className="navbar-brand">
                🛡️ <span>ElderGuard</span>
            </Link>
            <div className="navbar-right">
                <span className="navbar-user">{user.name}</span>
                <span className="navbar-role">{user.role}</span>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => logout()}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
