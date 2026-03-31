"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Book, Smile, Heart, Star, X, 
  Calendar, Flame, AlertCircle, Trash, Copy, 
  ChevronLeft, Cloud, Save, Coffee, ThumbsUp, 
  Frown, Zap, Moon, Sun, Ghost 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import styles from "./journal.module.css";
import { useRouter } from "next/navigation";

interface Entry {
  id: string;
  date: string;
  mood: string;
  title: string;
  text: string;
  icon: any;
  color: string;
}

const MOODS = [
  { name: 'Great', icon: Smile, color: '#00ff9f' },
  { name: 'Focused', icon: Flame, color: '#f87171' },
  { name: 'Productive', icon: Zap, color: '#60a5fa' },
  { name: 'Reflective', icon: Moon, color: '#c084fc' },
  { name: 'Exhausted', icon: Coffee, color: '#fcd34d' },
  { name: 'Inspired', icon: Sun, color: '#fb923c' },
  { name: 'Struggling', icon: Ghost, color: '#94a3b8' },
  { name: 'Angry', icon: AlertCircle, color: '#ef4444' }
];

const MAX_CH_LIMIT = 12000; // ~1500-1800 words

const getMoodConfig = (moodString: string) => {
  return MOODS.find(m => m.name === moodString) || MOODS[0];
};

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [isReading, setIsReading] = useState<Entry | null>(null);
  const [newEntry, setNewEntry] = useState({ title: "", text: "", mood: "Great" });
  const [user, setUser] = useState<{ discordId: string; username: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  const wordCount = newEntry.text.trim() ? newEntry.text.trim().split(/\s+/).length : 0;
  const charCount = newEntry.text.length;

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/join");
      return;
    }
    const usr = JSON.parse(saved);
    setUser(usr);
    fetchEntries(usr.discordId);
  }, []);

  const fetchEntries = async (discordId: string) => {
    try {
      const res = await fetch(`/api/journal?discordId=${discordId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.entries.map((e: any) => {
          const cfg = getMoodConfig(e.mood);
          return {
            id: e.id,
            date: e.date,
            mood: e.mood,
            title: e.title,
            text: e.content,
            icon: cfg.icon,
            color: cfg.color
          };
        });
        setEntries(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addEntry = async () => {
    if (newEntry.title && newEntry.text && user) {
      const dateStr = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      try {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discordId: user.discordId,
            title: newEntry.title,
            content: newEntry.text,
            mood: newEntry.mood,
            date: dateStr
          })
        });

        if (res.ok) {
          fetchEntries(user.discordId);
          setIsWriting(false);
          setNewEntry({ title: "", text: "", mood: "Great" });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeEntry = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      const res = await fetch(`/api/journal?id=${id}&discordId=${user.discordId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (isReading?.id === id) setIsReading(null);
        fetchEntries(user.discordId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className={styles.container}>
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.titleArea}>
          <h1 className="text-gradient">Journal of Records</h1>
          <p className={styles.entryCount}>{entries.length} SESSIONS_RECORDED</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Query archives..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="button button-primary" onClick={() => setIsWriting(true)}>
            <Plus size={18} /> COMPOSE_NEW
          </button>
        </div>
      </motion.header>

      {/* Empty State */}
      {entries.length === 0 && !isWriting && (
        <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Book size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '1rem' }}>NO RECORDS FOUND</h3>
          <p style={{ fontFamily: 'monospace', opacity: 0.6 }}>The internal chronicles are currently void. Start your first protocol submission.</p>
        </div>
      )}

      {/* Journal Grid */}
      <div className={styles.entryGrid}>
        <AnimatePresence>
          {filteredEntries.map((entry, i) => (
            <motion.div 
              key={entry.id} 
              className="card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setIsReading(entry)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.entryDate}>{entry.date}</div>
                <div className={styles.moodBadge} style={{ color: entry.color, backgroundColor: `${entry.color}15`, border: `1px solid ${entry.color}30` }}>
                  <entry.icon size={14} />
                  <span>{entry.mood}</span>
                </div>
              </div>
              <h3 className={styles.entryTitle}>{entry.title}</h3>
              <p className={styles.entryText}>{entry.text}</p>
              <div className={styles.cardFooter}>
                <button className={styles.deleteBtn} onClick={(e) => removeEntry(entry.id, e)}>
                  <Trash size={16} />
                </button>
                <div className={styles.readMore}>OPEN_FILE <ChevronLeft size={16} style={{ rotate: '180deg' }} /></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Full-screen Writing Overlay */}
      <AnimatePresence>
        {isWriting && (
          <motion.div 
            className={styles.writingOverlay}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.editorContainer}>
              <header className={styles.editorHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Cloud size={18} color="var(--accent)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'monospace' }}>AUTO_SYNC_PROTOCOL_V5.1</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <button className="button button-secondary" onClick={() => setIsWriting(false)}>DISCARD</button>
                  <button className="button button-primary" onClick={addEntry}>SUBMIT_RECORD</button>
                </div>
              </header>

              <div className={styles.editorBody}>
                <input 
                  autoFocus
                  className={styles.editorTitleInput}
                  placeholder="JOURNAL_TITLE_HERE..."
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                />
                
                <div className={styles.moodSelector}>
                  {MOODS.map(m => (
                    <div 
                      key={m.name}
                      className={`${styles.moodOption} ${newEntry.mood === m.name ? styles.active : ''}`}
                      onClick={() => setNewEntry({...newEntry, mood: m.name})}
                      style={{ color: newEntry.mood === m.name ? m.color : 'inherit' }}
                    >
                      <m.icon size={24} />
                      <span className={styles.moodLabel}>{m.name}</span>
                    </div>
                  ))}
                </div>

                <textarea 
                  className={styles.editorTextArea}
                  placeholder="Record your progress, thoughts, and reflections for the archive..."
                  value={newEntry.text}
                  maxLength={MAX_CH_LIMIT}
                  onChange={(e) => setNewEntry({...newEntry, text: e.target.value})}
                />

                <div className={styles.counter}>
                  <div className={styles.counterItem}>
                    <Book size={14} /> <span>{wordCount} Words</span>
                  </div>
                  <div className={`${styles.counterItem} ${charCount > MAX_CH_LIMIT * 0.9 ? styles.critical : ''}`}>
                    <AlertCircle size={14} /> <span>{charCount} / {MAX_CH_LIMIT} Characters</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Overlay */}
      <AnimatePresence>
        {isReading && (
          <motion.div 
            className={styles.writingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '0' }}
          >
            <div style={{ position: 'fixed', top: '2rem', left: '2rem' }}>
               <button className="button button-secondary" onClick={() => setIsReading(null)}>
                 <ChevronLeft size={18} /> BACK_TO_ARCHIVES
               </button>
            </div>
            <div style={{ position: 'fixed', top: '2rem', right: '2rem' }}>
               <button className="button button-secondary" onClick={() => removeEntry(isReading.id)} style={{ color: '#ef4444', borderColor: '#ef444420' }}>
                 <Trash size={18} /> PURGE_RECORD
               </button>
            </div>

            <motion.div 
              className={styles.readingView}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.readingHeader}>
                <div className={styles.readingMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{isReading.date}</span>
                  </div>
                  <div className={styles.moodBadge} style={{ color: isReading.color, backgroundColor: `${isReading.color}15`, border: `1px solid ${isReading.color}30` }}>
                    <isReading.icon size={14} />
                    <span>{isReading.mood}</span>
                  </div>
                </div>
                <h1 className={styles.readingTitle}>{isReading.title}</h1>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', opacity: 0.6, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Book size={14} /> {isReading.text.split(/\s+/).length} Words
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Moon size={14} /> {isReading.text.length} Characters
                  </div>
                </div>
              </div>
              <div className={styles.readingContent}>
                {isReading.text}
              </div>
              
              <div style={{ marginTop: '4rem', opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '1px', background: 'var(--accent)' }}></div>
                <div style={{ margin: '0 1rem', fontSize: '0.6rem', letterSpacing: '0.4em' }}>END_OF_RECORD</div>
                <div style={{ width: '40px', height: '1px', background: 'var(--accent)' }}></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
