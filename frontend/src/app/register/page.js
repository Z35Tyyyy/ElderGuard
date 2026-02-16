"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "senior" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await register(form);
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
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Create Account</h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                        Join ElderGuard to protect your finances
                    </p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

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
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <select
                            className="form-input form-select"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="senior">👤 Senior Citizen</option>
                            <option value="guardian">🛡️ Guardian</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? <span className="spinner" /> : "Create Account"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ fontWeight: 600 }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
