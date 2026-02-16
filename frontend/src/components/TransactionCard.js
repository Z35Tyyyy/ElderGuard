"use client";

import StatusBadge from "./StatusBadge";

export default function TransactionCard({ txn, showActions, onApprove, onReject, loading }) {
    const date = new Date(txn.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const seniorName = txn.seniorId?.name || "Unknown";

    return (
        <div className={`txn-card status-${txn.status}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div className="txn-amount">₹{txn.amount.toLocaleString("en-IN")}</div>
                    <div className="txn-recipient">To: {txn.recipient}</div>
                </div>
                <StatusBadge status={txn.status} />
            </div>

            {txn.reason && <div className="txn-reason">"{txn.reason}"</div>}

            {showActions && (
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "0.75rem" }}>
                    Requested by: <strong>{seniorName}</strong>
                </div>
            )}

            <div className="txn-meta">
                <span className="txn-date">{date}</span>

                {showActions && txn.status === "PENDING_APPROVAL" && (
                    <div className="btn-group">
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => onApprove(txn._id)}
                            disabled={loading}
                        >
                            ✓ Approve
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onReject(txn._id)}
                            disabled={loading}
                        >
                            ✕ Reject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
