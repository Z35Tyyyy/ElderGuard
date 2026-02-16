"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/lib/api";

const THRESHOLD = 5000;

export default function NewTransactionPage() {
    const router = useRouter();
    const [form, setForm] = useState({ amount: "", recipient: "", reason: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const amount = parseFloat(form.amount) || 0;
    const isHighRisk = amount > THRESHOLD;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await createTransaction({
                amount: parseFloat(form.amount),
                recipient: form.recipient,
                reason: form.reason,
            });
            router.push("/senior");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ marginBottom: "2rem" }}>
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => router.push("/senior")}
                        style={{ marginBottom: "1rem" }}
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="section-title">New Transaction</h1>
                    <p className="section-subtitle">Create a new money transfer request</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <div className="card" style={{ padding: "2rem" }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Amount (₹)</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="Enter amount"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                required
                                min="1"
                                step="any"
                                style={{ fontSize: "1.25rem", fontWeight: 600 }}
                            />
                        </div>

                        {isHighRisk && (
                            <div className="threshold-warning">
                                ⚠️ This amount exceeds ₹{THRESHOLD.toLocaleString("en-IN")}. Guardian approval will be required.
                            </div>
                        )}

                        <div className="form-group" style={{ marginTop: "1.25rem" }}>
                            <label className="form-label">Recipient Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Who is this for?"
                                value={form.recipient}
                                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Reason (optional)</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g., Medical bills, Gift, etc."
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-full btn-lg ${isHighRisk ? "btn-danger" : "btn-success"}`}
                            disabled={loading}
                            style={{ marginTop: "1.5rem" }}
                        >
                            {loading ? (
                                <span className="spinner" />
                            ) : isHighRisk ? (
                                "🔒 Submit for Guardian Approval"
                            ) : (
                                "✓ Complete Transaction"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
