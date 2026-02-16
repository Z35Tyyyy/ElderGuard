"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyTransactions, approveTransaction, rejectTransaction, getMe, getPendingInvites, acceptInvite } from "@/lib/api";
import TransactionCard from "@/components/TransactionCard";

export default function GuardianDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [profile, setProfile] = useState(null);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteMsg, setInviteMsg] = useState({ type: "", text: "" });

    const fetchData = useCallback(async () => {
        try {
            const [txnData, profileData, inviteData] = await Promise.all([
                getMyTransactions(),
                getMe(),
                getPendingInvites(),
            ]);
            setTransactions(txnData.transactions || []);
            setProfile(profileData.user);
            setInvites(inviteData.invites || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            await approveTransaction(id);
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        setActionLoading(true);
        try {
            await rejectTransaction(id);
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptInvite = async (token) => {
        setInviteMsg({ type: "", text: "" });
        setInviteLoading(true);
        try {
            await acceptInvite(token);
            setInviteMsg({ type: "success", text: "Invitation accepted! You are now linked." });
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

    const pending = transactions.filter((t) => t.status === "PENDING_APPROVAL");
    const history = transactions.filter((t) => t.status !== "PENDING_APPROVAL");
    const linkedSenior = profile?.linkedSeniorId;

    return (
        <div className="page-container">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Guardian Dashboard</h1>
                    <p className="section-subtitle">Review and manage transaction requests</p>
                </div>
            </div>

            {/* Linked Senior Info */}
            {linkedSenior ? (
                <div className="guardian-info">
                    <span className="guardian-info-icon">🛡️</span>
                    <div className="guardian-info-text">
                        You are guarding: <strong>{linkedSenior.name} ({linkedSenior.email})</strong>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Pending Invites */}
                    {inviteMsg.text && (
                        <div className={`alert alert-${inviteMsg.type}`} style={{ marginBottom: "1rem" }}>
                            {inviteMsg.type === "error" ? "⚠️" : "✅"} {inviteMsg.text}
                        </div>
                    )}

                    {invites.length > 0 ? (
                        <div className="invite-section" style={{ textAlign: "left" }}>
                            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>📩 Pending Invitations</h3>
                            {invites.map((invite) => (
                                <div key={invite._id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {invite.seniorId?.name || "A senior"}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                                            {invite.seniorId?.email} wants you as their guardian
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleAcceptInvite(invite.token)}
                                        disabled={inviteLoading}
                                    >
                                        {inviteLoading ? <span className="spinner" /> : "Accept"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alert alert-warning" style={{ marginBottom: "2rem" }}>
                            ⚠️ You are not linked to any senior citizen yet. Ask them to send you an invite.
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--color-pending)" }}>{pending.length}</div>
                    <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--color-text)" }}>{transactions.length}</div>
                    <div className="stat-label">Total Transactions</div>
                </div>
            </div>

            {/* Pending Approvals */}
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-pending)" }}>
                ⏳ Pending Approvals ({pending.length})
            </h2>

            {pending.length === 0 ? (
                <div className="empty-state" style={{ marginBottom: "2rem" }}>
                    <div className="empty-state-icon">✅</div>
                    <div className="empty-state-text">All caught up!</div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                        No pending transactions to review.
                    </p>
                </div>
            ) : (
                <div className="card-grid" style={{ marginBottom: "2rem" }}>
                    {pending.map((txn) => (
                        <TransactionCard
                            key={txn._id}
                            txn={txn}
                            showActions
                            onApprove={handleApprove}
                            onReject={handleReject}
                            loading={actionLoading}
                        />
                    ))}
                </div>
            )}

            {/* History */}
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                📜 History
            </h2>

            {history.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">No history yet</div>
                </div>
            ) : (
                <div className="card-grid">
                    {history.map((txn) => (
                        <TransactionCard key={txn._id} txn={txn} showActions={false} />
                    ))}
                </div>
            )}
        </div>
    );
}

