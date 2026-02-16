"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getUser } from "@/lib/auth";

export default function SeniorLayout({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const user = getUser();
        if (!user) {
            router.push("/login");
        } else if (user.role !== "senior") {
            router.push("/guardian");
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) return null;

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
