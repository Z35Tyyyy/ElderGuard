"use client";

export default function StatusBadge({ status }) {
    const statusMap = {
        CREATED: { label: "Created", className: "badge-created" },
        PENDING_APPROVAL: { label: "Pending", className: "badge-pending" },
        APPROVED: { label: "Approved", className: "badge-approved" },
        COMPLETED: { label: "Completed", className: "badge-completed" },
        REJECTED: { label: "Rejected", className: "badge-blocked" },
        BLOCKED: { label: "Blocked", className: "badge-blocked" },
    };

    const info = statusMap[status] || { label: status, className: "" };

    return <span className={`badge ${info.className}`}>{info.label}</span>;
}
