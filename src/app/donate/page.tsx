import React from 'react';
import styles from './Donate.module.css';
import { Heart, ShieldCheck, Zap } from 'lucide-react';

const DonatePage = () => {
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <Heart className={styles.heart} />
                    <h1 className={styles.title}>Support the Mission</h1>
                    <p className={styles.subtitle}>
                        Your contribution fuels the growth of Marathon Server.
                    </p>
                </header>

                <div className={styles.card}>
                    <div className={styles.infoSection}>
                        <div className={styles.infoItem}>
                            <ShieldCheck className={styles.icon} />
                            <div>
                                <h3>100% Transparency</h3>
                                <p>Every single penny you donate goes directly back into server maintenance, features, and community rewards.</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Zap className={styles.icon} />
                            <div>
                                <h3>Community Growth</h3>
                                <p>Donations help us scale the community by funding <strong>Server Boosts</strong>, custom <strong>Server Tags</strong>, and organizing exclusive competitions and events.</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Heart className={styles.icon} />
                            <div>
                                <h3>Enhanced Rewards</h3>
                                <p>We funnel contributions back into the ecosystem to increase the rewards pool, allowing us to offer higher-tier prizes for our top achievers.</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Zap className={styles.icon} />
                            <div>
                                <h3>Exclusive Events</h3>
                                <p>Contributions help us host unique competitions, workshops, and community-led events that keep the Marathon spirit alive and rewarding.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.qrSection}>
                        <div className={styles.qrWrapper}>
                            <img 
                                src="/qr.png" 
                                alt="Donate QR Code" 
                                className={styles.qrImage} 
                            />
                        </div>
                        <p className={styles.upiId}>UPI ID: <span>harleen.mit@oksbi</span></p>
                        <p className={styles.instruction}>Scan the QR code above with any UPI app to donate.</p>
                    </div>
                </div>

                <footer className={styles.pageFooter}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerItem}>
                            <Heart size={20} />
                            <span>Server Boosts</span>
                        </div>
                        <div className={styles.footerItem}>
                            <Zap size={20} />
                            <span>Custom Tags</span>
                        </div>
                        <div className={styles.footerItem}>
                            <ShieldCheck size={20} />
                            <span>Community Events</span>
                        </div>
                    </div>
                    <p className={styles.footerTagline}>"Building the future of digital productivity, together."</p>
                </footer>
            </div>
        </main>
    );
};

export default DonatePage;
