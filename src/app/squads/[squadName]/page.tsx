'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './squad-detail.module.css';

interface Member {
  discordId: string;
  username: string;
  avatar: string;
  xp: number;
  weeklyXp: number;
  streak: number;
  rank: number;
}

interface SquadData {
  name: string;
  totalXp: number;
  activeMemberCount: number;
  totalMemberCount: number;
  avgXp: number;
  mvp: Member | null;
  top3: Member[];
  members: Member[];
  rivalry: { type: 'ahead' | 'behind', target: string, diff: number } | null;
}

export default function SquadDetail({ params }: { params: Promise<{ squadName: string }> }) {
  const unwrappedParams = use(params);
  const squadName = decodeURIComponent(unwrappedParams.squadName);
  
  const [data, setData] = useState<SquadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSquadData = async () => {
      try {
        const res = await fetch(`/api/squads/${encodeURIComponent(squadName)}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch squad data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSquadData();
    const interval = setInterval(fetchSquadData, 30000);
    return () => clearInterval(interval);
  }, [squadName]);

  const getThemeProps = (name: string) => {
    switch(name) {
      case 'Zenith Sentinels': return { 
        color: 'var(--squad-zenith)', 
        glow: 'var(--squad-zenith-glow)', 
        motto: '"None Stand Above."',
        vibe: 'The traditional gatekeepers. A high-contrast, regal squad that represents the absolute highest point and the difficulty of reaching it.'
      };
      case 'Apex Titans': return { 
        color: 'var(--squad-apex)', 
        glow: 'var(--squad-apex-glow)', 
        motto: '"The Peak is Our Domain."',
        vibe: 'Focused on raw strength and the singular goal of being at the summit. The unshakeable powerhouse of the leaderboard.'
      };
      case 'Meridian Arbiters': return { 
        color: 'var(--squad-meridian)', 
        glow: 'var(--squad-meridian-glow)', 
        motto: '"Control the Center, Rule the Field."',
        vibe: 'Representing the balance and the turning point. The strategists who understand that the path to the top is won in the middle.'
      };
      case 'Horizon Vanguards': return { 
        color: 'var(--squad-horizon)', 
        glow: 'var(--squad-horizon-glow)', 
        motto: '"No Limit. No End."',
        vibe: 'The explorers and the fast-movers. Driven by the infinite potential of the climb to push past every boundary.'
      };
      default: return { color: '#ffffff', glow: 'rgba(255,255,255,0.1)', motto: '', vibe: '' };
    }
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

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container} style={{ textAlign: 'center', marginTop: '100px' }}>Loading squad data...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container} style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>Squad not found</h2>
            <Link href="/squads" style={{ color: 'var(--accent)' }}>Return to Leaderboard</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const theme = getThemeProps(data.name);

  return (
    <div style={{
      '--squad-color': theme.color,
      '--squad-glow': theme.glow
    } as React.CSSProperties}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          
          <div className={styles.banner}>
            {getLogoPath(data.name) && (
              <div className={styles.bannerImageWrapper}>
                <Image src={getLogoPath(data.name)} alt={`${data.name} Banner`} fill className={styles.bannerImage} priority />
                <div className={styles.bannerOverlay}></div>
              </div>
            )}
            
            <div className={styles.bannerContentWrapper}>
              <div className={styles.bannerContent}>
                <div className={styles.bannerText}>
                  <h1 className={styles.title}>{data.name}</h1>
                  <div className={styles.motto}>{theme.motto}</div>
                  <div className={styles.vibe}>{theme.vibe}</div>
                </div>
              </div>
              
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{data.totalXp.toLocaleString()}</div>
                  <div className={styles.statLabel}>Total Weekly XP</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{data.activeMemberCount} / {data.totalMemberCount}</div>
                  <div className={styles.statLabel}>Active Members</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{data.avgXp.toLocaleString()}</div>
                  <div className={styles.statLabel}>Avg XP/Member</div>
                </div>
              </div>
            </div>
          </div>

          {data.rivalry && (
            <div className={styles.rivalryBanner}>
              {data.rivalry.type === 'ahead' ? (
                <>🔥 You are <span className={styles.rivalryAhead}>ahead</span> of {data.rivalry.target} by {data.rivalry.diff.toLocaleString()} XP</>
              ) : (
                <>⚠️ You are <span className={styles.rivalryBehind}>behind</span> {data.rivalry.target} by {data.rivalry.diff.toLocaleString()} XP</>
              )}
            </div>
          )}

          <h2 className={styles.sectionTitle}>Top Contributors</h2>
          <div className={styles.topContributors}>
            {data.top3.map((member, idx) => (
              <div key={member.discordId} className={`${styles.contributorCard} ${idx === 0 ? styles.mvpCard : ''}`}>
                {idx === 0 && <div className={styles.mvpBadge}>MVP</div>}
                <img src={member.avatar || '/default-avatar.png'} alt={member.username} className={styles.avatar} />
                <div className={styles.userInfo}>
                  <div className={styles.username}>{member.username}</div>
                  <div className={styles.userXp}>{member.weeklyXp.toLocaleString()} XP</div>
                </div>
              </div>
            ))}
            {data.top3.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No active contributors yet.</div>}
          </div>

          <h2 className={styles.sectionTitle}>Full Roster</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.rosterTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Member</th>
                  <th>Weekly XP</th>
                  <th>Streak</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((member) => {
                  const isActive = member.weeklyXp >= 100;
                  return (
                    <tr key={member.discordId} className={`${styles.rosterRow} ${!isActive ? styles.inactiveRow : ''}`}>
                      <td className={styles.rankCell}>#{member.rank}</td>
                      <td className={styles.userCell}>
                        <img src={member.avatar || '/default-avatar.png'} alt={member.username} className={styles.smallAvatar} />
                        {member.username}
                      </td>
                      <td className={styles.xpCell}>{member.weeklyXp.toLocaleString()}</td>
                      <td>{member.streak} 🔥</td>
                      <td style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {isActive ? 'Active' : 'Inactive'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
