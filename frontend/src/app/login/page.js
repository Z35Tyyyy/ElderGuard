"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login(form);
            saveAuth(data.token, data.user);
            router.push(data.user.role === "senior" ? "/senior" : "/guardian");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🛡️</div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Welcome Back</h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                        Sign in to your ElderGuard account
                    </p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? <span className="spinner" /> : "Sign In"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" style={{ fontWeight: 600 }}>Create One</Link>
                </p>
            </div>
        </div>
    );
}
