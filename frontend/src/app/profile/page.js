"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, deleteAccount } from "@/lib/api";
import { logout } from "@/lib/auth";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [deleteMsg, setDeleteMsg] = useState({ type: "", text: "" });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDangerZone, setShowDangerZone] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMe();
                setProfile(data.user);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleDelete = async (e) => {
        e.preventDefault();
        setDeleteMsg({ type: "", text: "" });
        setDeleteLoading(true);
        try {
            await deleteAccount(password, confirmation);
            logout();
        } catch (err) {
            setDeleteMsg({ type: "error", text: err.message });
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
                <div className="spinner" style={{ margin: "0 auto", width: 40, height: 40, borderWidth: 3 }} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">⚠️</div>
                    <div className="empty-state-text">Could not load profile</div>
                </div>
            </div>
        );
    }

    const isConfirmValid = confirmation.toLowerCase() === "delete";

    return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <div className="section-header">
                <div>
                    <h1 className="section-title">Profile</h1>
                    <p className="section-subtitle">Manage your account</p>
                </div>
            </div>

            {/* Account Info */}
            <div className="profile-card">
                <div className="profile-card-header">
                    <div className="profile-avatar">
                        {profile.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="profile-name">{profile.name}</h2>
                        <span className="navbar-role">{profile.role}</span>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="profile-detail-row">
                        <span className="profile-detail-label">📧 Email</span>
                        <span className="profile-detail-value">{profile.email}</span>
                    </div>
                    <div className="profile-detail-row">
                        <span className="profile-detail-label">🔑 Role</span>
                        <span className="profile-detail-value" style={{ textTransform: "capitalize" }}>{profile.role}</span>
                    </div>
                    {profile.role === "senior" && profile.guardianId && (
                        <div className="profile-detail-row">
                            <span className="profile-detail-label">🛡️ Guardian</span>
                            <span className="profile-detail-value" style={{ color: "var(--color-success)" }}>
                                {profile.guardianId.name} ({profile.guardianId.email})
                            </span>
                        </div>
                    )}
                    {profile.role === "guardian" && profile.linkedSeniorId && (
                        <div className="profile-detail-row">
                            <span className="profile-detail-label">👴 Linked Senior</span>
                            <span className="profile-detail-value" style={{ color: "var(--color-success)" }}>
                                {profile.linkedSeniorId.name} ({profile.linkedSeniorId.email})
                            </span>
                        </div>
                    )}
                    <div className="profile-detail-row">
                        <span className="profile-detail-label">📅 Joined</span>
                        <span className="profile-detail-value">
                            {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric", month: "long", day: "numeric"
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone">
                <button
                    className="danger-zone-toggle"
                    onClick={() => setShowDangerZone(!showDangerZone)}
                >
                    <div className="danger-zone-toggle-left">
                        <span className="danger-zone-icon">⚠️</span>
                        <div>
                            <div className="danger-zone-title">Danger Zone</div>
                            <div className="danger-zone-subtitle">Irreversible account actions</div>
                        </div>
                    </div>
                    <span className="danger-zone-chevron">{showDangerZone ? "▲" : "▼"}</span>
                </button>

                {showDangerZone && (
                    <div className="danger-zone-content">
                        <div className="danger-zone-warning">
                            <strong>Delete your account</strong>
                            <p>Once you delete your account, there is no going back. All your data, transactions, and guardian links will be permanently removed.</p>
                        </div>

                        {deleteMsg.text && (
                            <div className={`alert alert-${deleteMsg.type}`}>
                                {deleteMsg.type === "error" ? "⚠️" : "✅"} {deleteMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleDelete} className="danger-zone-form">
                            <div className="form-group">
                                <label className="form-label">Your password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    To confirm, type <strong style={{ color: "var(--color-danger)" }}>delete</strong> below
                                </label>
                                <input
                                    className="form-input danger-zone-confirm-input"
                                    type="text"
                                    placeholder="delete"
                                    value={confirmation}
                                    onChange={(e) => setConfirmation(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-danger btn-full"
                                disabled={!isConfirmValid || !password || deleteLoading}
                            >
                                {deleteLoading ? (
                                    <span className="spinner" />
                                ) : (
                                    "Delete this account"
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
