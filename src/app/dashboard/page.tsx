"use client";

import { motion } from "framer-motion";
import { Zap, Target, History, Clock, Rocket, Book, ChevronRight, Layout } from "lucide-react";
import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";

interface DashboardData {
  user: {
    username: string;
    xp: number;
    weeklyXp: number;
  };
  stats: {
    totalSessions: number;
    recentSessions: Array<{
      id: string;
      duration: number;
      xpGranted: number;
      createdAt: string;
    }>;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [isAsleep, setIsAsleep] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/join");
      return;
    }
    const usr = JSON.parse(saved);
    fetchDashboard(usr.discordId);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async (discordId: string) => {
    try {
      const res = await fetch(`/api/user?discordId=${discordId}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else if (res.status === 401 || res.status === 404) {
        setIsAsleep(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("user");
    router.push("/join");
  };

  if (isAsleep) return (
    <div className={styles.sleepState}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.sleepCard}
      >
        <Clock size={48} color="var(--accent)" />
        <h2>DASHBOARD_SLEEP_MODE</h2>
        <p>Your account is being used after a long time and the dashboard has gone to sleep.</p>
        <p className={styles.subText}>Please disconnect and then re-login via <code>/link</code> in Marathon server.</p>
        <button onClick={handleDisconnect} className={styles.disconnectBtn}>
          DISCONNECT_SYSTEM
        </button>
      </motion.div>
    </div>
  );

  if (!data) return (
    <div className={styles.syncLoading}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        SYNCING_USER_RECORDS...
      </motion.div>
    </div>
  );

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header HUD */}
      <div className={styles.header}>
        <div className={styles.statusInfo}>
          <span className={styles.statusLabel}>SYSTEM_OPERATIONAL_PROTOCOLS</span>
          <h1 className={styles.welcomeText}>
            Welcome back, <span className="text-gradient">{data.user.username.toUpperCase()}</span>
          </h1>
        </div>
        <div className={styles.tickerArea}>
          <div className={styles.timeTicker}>
            <Clock size={16} color="var(--accent)" />
            <span>{currentTime || '00:00:00'}</span>
          </div>
          <div className={styles.timeTicker} style={{ borderColor: 'var(--accent-strong)' }}>
            <Zap size={16} color="var(--accent)" />
            <span>XP: {data.user.xp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Primary Analytics */}
      <div className={styles.statsGrid}>
        <motion.div
          className={styles.statCard}
          whileHover={{ y: -5 }}
        >
          <div className={styles.statGlow} style={{ background: 'var(--accent)' }} />
          <div className={styles.statIcon}>
            <Zap size={32} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.label}>WEEKLY_XP_GAINS</span>
            <h2 className={styles.value}>
              {(data.user.weeklyXp || 0).toLocaleString()}
              <span className={styles.unit}>XP</span>
            </h2>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          whileHover={{ y: -5 }}
        >
          <div className={styles.statGlow} style={{ background: '#60a5fa' }} />
          <div className={styles.statIcon} style={{ color: '#60a5fa' }}>
            <History size={32} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.label}>TOTAL_RECORDS</span>
            <h2 className={styles.value}>
              {data.stats.totalSessions}
              <span className={styles.unit}>SESSIONS</span>
            </h2>
          </div>
        </motion.div>
      </div>

      {/* HUD Layout */}
      <div className={styles.mainGrid}>
        <section>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>SESSION_LOGS</h3>
            <div className={styles.liveTag}>
              <div className={styles.dot} /> MONITORING_ACTIVE
            </div>
          </div>

          <div className={styles.cardInner}>
            <div className={styles.progressLabelArea}>
              <span className={styles.progressLabel}>WEEKLY_OBJECTIVE_STATUS</span>
              <span className={styles.progressPercentage}>
                {Math.min(100, Math.floor(((data.user.weeklyXp || 0) / 1000) * 100))}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, Math.floor(((data.user.weeklyXp || 0) / 1000) * 100))}%` }}
              />
            </div>

            <div className={styles.sessionArchives}>
              <h4 className={styles.archivesTitle}>RECENT_TRANSMISSIONS</h4>
              {data.stats.recentSessions.map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <Rocket size={16} />
                  <span className={styles.sessionTime}>
                    {Math.floor(session.duration / 60000)}m Recorded
                  </span>
                  <span className={styles.sessionPoints}>
                    +{session.xpGranted} XP GAIN
                  </span>
                </div>
              ))}
              {data.stats.recentSessions.length === 0 && (
                <div style={{ padding: '2rem', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>
                  NO_RECENT_ACTIVITY_DETECTED
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar Commands */}
        <aside>
          <span className={styles.hudTitle}>QUICK_COMMAND_LINE</span>
          <div className={styles.terminalLinks}>
            <button className={styles.terminalBtn} onClick={() => router.push('/tasks')}>
              <div className={styles.btnLabel}>
                <Target size={18} /> OPEN_TARGETS
              </div>
              <ChevronRight size={14} opacity={0.5} />
            </button>
            <button className={styles.terminalBtn} onClick={() => router.push('/journal')}>
              <div className={styles.btnLabel}>
                <Book size={18} /> OPEN_CHRONICLES
              </div>
              <ChevronRight size={14} opacity={0.5} />
            </button>
            <button className={styles.terminalBtn} onClick={() => router.push('/planner')}>
              <div className={styles.btnLabel}>
                <Layout size={18} /> OPEN_GRID_PLANNER
              </div>
              <ChevronRight size={14} opacity={0.5} />
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
