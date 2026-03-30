import React from "react";
import styles from "../terms/terms.module.css"; // Reuse styling

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className="section-label">Legal</span>
        <h1 className="text-gradient">Privacy Policy</h1>
        <p className={styles.lead}>Last updated: {currentYear}-01-01</p>
      </header>

      <section className={styles.content}>
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us through Discord and our platform, such as your study logs, goals, and profile information.</p>

        <h2>2. How We Use Information</h2>
        <p>Your information is used to compute leaderboard ranks, provide feedback on your consistency, and manage the study community through automated systems.</p>

        <h2>3. Community Transparency</h2>
        <p>Public study logs are visible to other members of the Marathon Server community to foster accountability and healthy competition.</p>

        <h2>4. Third-Party Services</h2>
        <p>We use Discord for identity verification and community management. Please refer to Discord's privacy policy for their data practices.</p>

        <h2>5. Security Measures</h2>
        <p>We utilize industry-standard practices to protect your information and ensure our API integrations are secure and efficient.</p>

        <h2>6. Contact</h2>
        <p>If you have any questions regarding your privacy, please email marathonxserver@gmail.com.</p>
      </section>
    </div>
  );
}
