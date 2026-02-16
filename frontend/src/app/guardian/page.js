"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyTransactions, approveTransaction, rejectTransaction, getMe } from "@/lib/api";
import TransactionCard from "@/components/TransactionCard";

export default function GuardianDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

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
                <div className="alert alert-warning" style={{ marginBottom: "2rem" }}>
                    ⚠️ You are not linked to any senior citizen yet. Ask them to send you an invite.
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
