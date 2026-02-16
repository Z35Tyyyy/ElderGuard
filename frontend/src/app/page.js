"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-hero">
      <div className="landing-shield">🛡️</div>
      <h1 className="landing-title">
        <span>ElderGuard</span>
      </h1>
      <p className="landing-desc">
        Protect your loved ones from financial scams. Our guardian-based multi-factor
        authentication ensures no high-risk transaction goes through without
        trusted approval.
      </p>
      <div className="landing-buttons">
        <Link href="/register" className="btn btn-primary btn-lg">Get Started</Link>
        <Link href="/login" className="btn btn-outline btn-lg">Sign In</Link>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <div className="feature-title">Guardian Approval</div>
          <div className="feature-desc">
            High-value transactions require explicit approval from a trusted guardian before execution.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📧</div>
          <div className="feature-title">Instant Alerts</div>
          <div className="feature-desc">
            Guardians receive email notifications immediately when a transaction needs review.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🚫</div>
          <div className="feature-title">Scam Prevention</div>
          <div className="feature-desc">
            Even if OTPs are shared unknowingly, transactions are blocked without guardian consent.
          </div>
        </div>
      </div>
    </main>
  );
}
