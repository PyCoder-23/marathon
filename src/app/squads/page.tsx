'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './squads.module.css';

interface SquadStats {
  name: string;
  squadXp: number;
  activeMembers: number;
  totalMembers: number;
  rank: number;
  winStreak: number;
  allTimeWins: number;
}

export default function SquadsOverview() {
  const [squads, setSquads] = useState<SquadStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSquads = async () => {
      try {
        const res = await fetch('/api/squads');
        const data = await res.json();
        if (data.success) {
          setSquads(data.squads);
        }
      } catch (error) {
        console.error('Failed to fetch squads', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSquads();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSquads, 30000);
    return () => clearInterval(interval);
  }, []);

  const getThemeColor = (name: string) => {
    switch(name) {
      case 'Zenith Sentinels': return 'var(--squad-zenith)';
      case 'Apex Titans': return 'var(--squad-apex)';
      case 'Meridian Arbiters': return 'var(--squad-meridian)';
      case 'Horizon Vanguards': return 'var(--squad-horizon)';
      default: return '#ffffff';
    }
  };

  const getThemeGlow = (name: string) => {
    switch(name) {
      case 'Zenith Sentinels': return 'var(--squad-zenith-glow)';
      case 'Apex Titans': return 'var(--squad-apex-glow)';
      case 'Meridian Arbiters': return 'var(--squad-meridian-glow)';
      case 'Horizon Vanguards': return 'var(--squad-horizon-glow)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  const getLeagueBadge = (rank: number) => {
    if (rank === 1) return { label: 'DIAMOND', class: styles.leagueDiamond };
    if (rank === 2) return { label: 'GOLD', class: styles.leagueGold };
    if (rank === 3) return { label: 'SILVER', class: styles.leagueSilver };
    return { label: 'BRONZE', class: styles.leagueBronze };
  };

  const getLogoPath = (name: string) => {
    switch(name) {
      case 'Zenith Sentinels': return '/zenith.png';
      case 'Apex Titans': return '/apex.png';
      case 'Meridian Arbiters': return '/meridian.png';
      case 'Horizon Vanguards': return '/horizon.png';
      default: return '';
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className="section-label">Competition</span>
            <h1 className={styles.title}>Squad Leaderboard</h1>
            <p className={styles.subtitle}>
              Four factions. One summit. Only active members (≥100 XP) contribute to the weekly standing.
            </p>
          </div>

          <div className={styles.leaderboard}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading standings...</div>
            ) : (
              squads.map((squad) => (
                <Link 
                  href={`/squads/${encodeURIComponent(squad.name)}`} 
                  key={squad.name}
                  className={styles.squadCard}
                  style={{
                    '--squad-color': getThemeColor(squad.name),
                    '--squad-glow': getThemeGlow(squad.name)
                  } as React.CSSProperties}
                >
                  <div className={styles.rank}>
                    #{squad.rank}
                  </div>
                  
                  <div className={styles.info}>
                    <h2 className={styles.squadName}>{squad.name}</h2>
                    <div className={styles.squadStats}>
                      <div className={styles.statItem}>
                        Active: <span>{squad.activeMembers}</span>/{squad.totalMembers}
                      </div>
                      <div className={styles.statItem}>
                        Win Streak: <span>{squad.winStreak}</span>
                      </div>
                      <div className={styles.statItem}>
                        All-Time Wins: <span>{squad.allTimeWins}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.rightSection}>
                    <div className={`${styles.leagueBadge} ${getLeagueBadge(squad.rank).class}`}>
                      {getLeagueBadge(squad.rank).label}
                    </div>
                    <div className={styles.xpBadge}>
                      <span className={styles.xpValue}>{squad.squadXp.toLocaleString()}</span>
                      <span className={styles.xpLabel}>Weekly XP</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
