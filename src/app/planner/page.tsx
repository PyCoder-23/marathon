"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./planner.module.css";
import { useRouter } from "next/navigation";
import { Plus, X, Trash } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  day: string;
  startTime: string; // "04:00"
  endTime: string;   // "05:00"
  color: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Hours from 4 AM today to 4 AM tomorrow (24 hours)
const HOURS = Array.from({ length: 24 }, (_, i) => (i + 4) % 24);

const COLORS = ["#00ff9f", "#60a5fa", "#f87171", "#fcd34d", "#c084fc"];

export default function PlannerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [user, setUser] = useState<{ discordId: string } | null>(null);
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Partial<CalendarEvent>>({});

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/join");
      return;
    }
    const usr = JSON.parse(saved);
    setUser(usr);
    fetchEvents(usr.discordId);
  }, []);

  const fetchEvents = async (discordId: string) => {
    try {
      const res = await fetch(`/api/planner?discordId=${discordId}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCellClick = (day: string, hour: number) => {
    const startHourStr = hour.toString().padStart(2, "0") + ":00";
    const endHourStr = ((hour + 1) % 24).toString().padStart(2, "0") + ":00";
    setActiveEvent({ day, startTime: startHourStr, endTime: endHourStr, color: COLORS[0], title: "" });
    setModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, evt: CalendarEvent) => {
    e.stopPropagation();
    setActiveEvent(evt);
    setModalOpen(true);
  };

  const saveEvent = async () => {
    if (!user || !activeEvent.title) return;

    try {
      const isNew = !activeEvent.id;
      if (isNew) {
        const res = await fetch("/api/planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...activeEvent, discordId: user.discordId })
        });
        if (res.ok) fetchEvents(user.discordId);
      } else {
        await fetch(`/api/planner?id=${activeEvent.id}`, { method: "DELETE" });
        await fetch("/api/planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...activeEvent, id: undefined, discordId: user.discordId })
        });
        fetchEvents(user.discordId);
      }
      setModalOpen(false);
      setActiveEvent({});
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEvent = async () => {
    if (!user || !activeEvent.id) return;
    try {
      const res = await fetch(`/api/planner?id=${activeEvent.id}`, { method: "DELETE" });
      if (res.ok) fetchEvents(user.discordId);
      setModalOpen(false);
      setActiveEvent({});
    } catch (err) {
      console.error(err);
    }
  };

  // Convert time to pixels relative to 4 AM start (60px per hour)
  const getTopPosition = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    // Adjust hour so 4 AM is 0
    let relativeHour = (h - 4);
    if (relativeHour < 0) relativeHour += 24;
    return relativeHour * 60 + (m / 60) * 60;
  };

  const getHeight = (startStr: string, endStr: string) => {
    let start = getTopPosition(startStr);
    let end = getTopPosition(endStr);
    
    // Handle overnight events (e.g., 11 PM to 5 AM)
    if (end < start) end += (24 * 60);
    
    return Math.max(end - start, 30);
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-gradient">Week Planner</h1>
        <button className="button button-primary" onClick={() => { setActiveEvent({ day: "Monday", startTime: "04:00", endTime: "05:00", color: COLORS[0], title: "" }); setModalOpen(true); }}>
          <Plus size={18} /> Add Event
        </button>
      </header>
      
      <div className={styles.calendarWrapper}>
        <div className={styles.daysHeader}>
          <div className={styles.timeColHead}></div>
          {DAYS.map(d => (
            <div key={d} className={styles.dayHead}>{d}</div>
          ))}
        </div>

        <div className={styles.calendarBody}>
          <div className={styles.timeCol}>
            {HOURS.map(h => (
              <div key={h} className={styles.timeSlot}>
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {DAYS.map(day => (
            <div key={day} className={styles.dayCol}>
              {HOURS.map(h => (
                <div key={h} className={styles.gridCell} onClick={() => handleCellClick(day, h)}></div>
              ))}

              {events.filter(e => e.day === day).map(evt => (
                <div 
                  key={evt.id} 
                  className={styles.eventBlock}
                  style={{
                    backgroundColor: evt.color,
                    top: getTopPosition(evt.startTime) + "px",
                    height: getHeight(evt.startTime, evt.endTime) + "px"
                  }}
                  onClick={(e) => handleEventClick(e, evt)}
                >
                  <div className={styles.eventTitle}>{evt.title}</div>
                  <div className={styles.eventTime}>{evt.startTime} - {evt.endTime}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3>{activeEvent.id ? "Edit Event" : "Create Event"}</h3>
            
            <input 
              type="text" 
              placeholder="Event Title..." 
              value={activeEvent.title || ""}
              autoFocus
              onChange={(e) => setActiveEvent({ ...activeEvent, title: e.target.value })}
            />

            <select 
              value={activeEvent.day} 
              onChange={(e) => setActiveEvent({ ...activeEvent, day: e.target.value })}
            >
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <div style={{ display: "flex", gap: "1rem" }}>
              <input 
                type="time" 
                value={activeEvent.startTime} 
                onChange={(e) => setActiveEvent({ ...activeEvent, startTime: e.target.value })}
              />
              <input 
                type="time" 
                value={activeEvent.endTime} 
                onChange={(e) => setActiveEvent({ ...activeEvent, endTime: e.target.value })}
              />
            </div>

            <div className={styles.colorPicker}>
              {COLORS.map(c => (
                <div 
                  key={c}
                  className={`${styles.colorCircle} ${activeEvent.color === c ? styles.active : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setActiveEvent({ ...activeEvent, color: c })}
                />
              ))}
            </div>

            <div className={styles.modalActions}>
              {activeEvent.id && (
                <button className="button button-secondary" style={{ marginRight: 'auto', background: 'transparent', borderColor: '#ef4444', color: '#ef4444' }} onClick={deleteEvent}>
                  <Trash size={16} /> Delete
                </button>
              )}
              <button className="button button-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="button button-primary" onClick={saveEvent}>Save Event</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
