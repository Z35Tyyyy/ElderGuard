"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMyTransactions, sendInvite, getMe } from "@/lib/api";
import TransactionCard from "@/components/TransactionCard";

export default function SeniorDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [profile, setProfile] = useState(null);
    const [guardianEmail, setGuardianEmail] = useState("");
    const [inviteMsg, setInviteMsg] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(true);
    const [inviteLoading, setInviteLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [txnData, profileData] = await Promise.all([
                getMyTransactions(),
                getMe(),
            ]);
            setTransactions(txnData.transactions || []);
            setProfile(profileData.user);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteMsg({ type: "", text: "" });
        setInviteLoading(true);
        try {
            await sendInvite(guardianEmail);
            setInviteMsg({ type: "success", text: "Invitation sent successfully!" });
            setGuardianEmail("");
            fetchData();
        } catch (err) {
            setInviteMsg({ type: "error", text: err.message });
        } finally {
            setInviteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
                <div className="spinner" style={{ margin: "0 auto", width: 40, height: 40, borderWidth: 3 }} />
            </div>
        );
    }

    const pending = transactions.filter((t) => t.status === "PENDING_APPROVAL").length;
    const completed = transactions.filter((t) => t.status === "COMPLETED").length;
    const blocked = transactions.filter((t) => t.status === "BLOCKED").length;
    const hasGuardian = profile?.guardianId;

    return (
        <div className="page-container">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Senior Dashboard</h1>
                    <p className="section-subtitle">Manage your transactions securely</p>
                </div>
                <Link href="/senior/new-transaction" className="btn btn-primary">
                    + New Transaction
                </Link>
            </div>

            {/* Guardian Link Status */}
            {hasGuardian ? (
                <div className="guardian-info">
                    <span className="guardian-info-icon">✅</span>
                    <div className="guardian-info-text">
                        Your trusted guardian: <strong>{profile.guardianId.name} ({profile.guardianId.email})</strong>
                    </div>
                </div>
            ) : (
                <div className="invite-section">
                    <h3>🔗 Link a Guardian</h3>
                    <p>You need a trusted guardian to approve high-value transactions (above ₹5,000).</p>
                    {inviteMsg.text && (
                        <div className={`alert alert-${inviteMsg.type}`} style={{ maxWidth: 500, margin: "0 auto 1rem" }}>
                            {inviteMsg.type === "error" ? "⚠️" : "✅"} {inviteMsg.text}
                        </div>
                    )}
                    <form className="invite-form" onSubmit={handleInvite}>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="Guardian's email address"
                            value={guardianEmail}
                            onChange={(e) => setGuardianEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={inviteLoading}>
                            {inviteLoading ? <span className="spinner" /> : "Send Invite"}
                        </button>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--color-text)" }}>{transactions.length}</div>
                    <div className="stat-label">Total Transactions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--color-pending)" }}>{pending}</div>
                    <div className="stat-label">Pending Approval</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--color-success)" }}>{completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--color-danger)" }}>{blocked}</div>
                    <div className="stat-label">Blocked</div>
                </div>
            </div>

            {/* Transaction History */}
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Transaction History</h2>

            {transactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">No transactions yet</div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                        Create your first transaction to get started.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {transactions.map((txn) => (
                        <TransactionCard key={txn._id} txn={txn} />
                    ))}
                </div>
            )}
        </div>
    );
}
