"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { acceptInvite } from "@/lib/api";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function AcceptInvitePage() {
    const { token } = useParams();
    const router = useRouter();
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [message, setMessage] = useState("");
    const user = getUser();

    const handleAccept = async () => {
        setStatus("loading");
        try {
            const data = await acceptInvite(token);
            setStatus("success");
            setMessage(data.message || "You are now linked as a guardian!");
        } catch (err) {
            setStatus("error");
            setMessage(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Guardian Invitation
                </h1>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
                    You&apos;ve been invited to become a trusted guardian on ElderGuard.
                </p>

                {!user ? (
                    <div>
                        <div className="alert alert-warning">
                            ⚠️ You need to be logged in as a guardian to accept this invite.
                        </div>
                        <div className="btn-group" style={{ justifyContent: "center", marginTop: "1rem" }}>
                            <Link href="/login" className="btn btn-primary">Sign In</Link>
                            <Link href="/register" className="btn btn-outline">Register</Link>
                        </div>
                    </div>
                ) : user.role !== "guardian" ? (
                    <div className="alert alert-error">
                        ⚠️ Only guardian accounts can accept invitations. You are logged in as a {user.role}.
                    </div>
                ) : status === "success" ? (
                    <div>
                        <div className="alert alert-success">✅ {message}</div>
                        <button className="btn btn-primary btn-lg" onClick={() => router.push("/guardian")}>
                            Go to Dashboard
                        </button>
                    </div>
                ) : status === "error" ? (
                    <div>
                        <div className="alert alert-error">⚠️ {message}</div>
                        <button className="btn btn-outline" onClick={() => router.push("/guardian")}>
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <button
                        className="btn btn-success btn-lg btn-full"
                        onClick={handleAccept}
                        disabled={status === "loading"}
                    >
                        {status === "loading" ? <span className="spinner" /> : "✓ Accept Invitation"}
                    </button>
                )}
            </div>
        </div>
    );
}
