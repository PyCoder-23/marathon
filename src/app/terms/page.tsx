import React from "react";
import styles from "./terms.module.css";

export default function TermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className="section-label">Legal</span>
        <h1 className="text-gradient">Terms of Service</h1>
        <p className={styles.lead}>Last updated: {currentYear}-01-01</p>
      </header>

      <section className={styles.content}>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Marathon Server, you agree to bound by these Terms of Service. If you do not agree to all terms, you may not use our services.</p>

        <h2>2. Community Guidelines</h2>
        <p>Marathon Server is a space for productive growth. Harassment, spamming, or any behavior that compromises the collective focus of the community is strictly prohibited.</p>

        <h2>3. Account Synchronization</h2>
        <p>Our platform synchronizes with Discord. You are responsible for maintaining the confidentiality of your Discord account and any actions taken under your ID.</p>

        <h2>4. Limitation of Liability</h2>
        <p>Marathon Server is provided "as is" without warranty of any kind. We are not responsible for any direct, indirect, incidental, or consequential damages resulting from your use of the service.</p>

        <h2>5. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Changes will be effective upon posting on the website.</p>
      </section>
    </div>
  );
}
