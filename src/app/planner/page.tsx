"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import styles from "./planner.module.css";
import { useRouter } from "next/navigation";
import { 
  Plus, X, Trash, ChevronLeft, ChevronRight, 
  Calendar, Clock, LayoutGrid, List, Info,
  CheckCircle2
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string;
}

const COLORS = ["#00ff9f", "#3b82f6", "#ef4444", "#eab308", "#a855f7"];
const DAYS_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PlannerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [user, setUser] = useState<{ discordId: string } | null>(null);
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Partial<CalendarEvent>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  // Date Helpers
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Navigation
  const navigate = (direction: number) => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + direction);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + (direction * 7));
    } else {
      next.setDate(next.getDate() + direction);
    }
    setCurrentDate(next);
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  // Event Logic
  const handleCellClick = (dateStr: string, hour?: number) => {
    const startTime = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : "09:00";
    const endTime = hour !== undefined ? `${((hour + 1) % 24).toString().padStart(2, '0')}:00` : "10:00";
    setActiveEvent({ 
      date: dateStr, 
      startTime, 
      endTime, 
      color: COLORS[0], 
      title: "", 
      description: "" 
    });
    setModalOpen(true);
  };

  const openNewEvent = () => {
    setActiveEvent({ date: formatDateKey(currentDate), startTime: "09:00", endTime: "10:00", color: COLORS[0], title: "", description: "" });
    setModalOpen(true);
  };

  const handleEditEvent = (evt: CalendarEvent) => {
    setActiveEvent(evt);
    setModalOpen(true);
  };

  const saveEvent = async () => {
    if (!user) return;
    if (!activeEvent.title || !activeEvent.date) {
      alert("Please provide a title and date for your event.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeEvent, discordId: user.discordId })
      });
      
      if (res.ok) {
        await fetchEvents(user.discordId);
        setModalOpen(false);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to save event'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!user || !activeEvent.id) return;
    try {
      const res = await fetch(`/api/planner?id=${activeEvent.id}`, { method: "DELETE" });
      if (res.ok) fetchEvents(user.discordId);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Rendering Helpers
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const firstDayMondayStart = (firstDay + 6) % 7;
    
    // Prev month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];
    
    for (let i = firstDayMondayStart - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, current: true, date: new Date(year, month, i) });
    }
    
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, current: false, date: new Date(year, month + 1, i) });
    }

    return (
      <div className={styles.monthGrid}>
        {DAYS_SHORT.map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
        {cells.map((cell, i) => {
          const dateKey = formatDateKey(cell.date);
          const dayEvents = events.filter(e => e.date === dateKey);
          return (
            <div 
              key={i} 
              className={`${styles.monthCell} ${!cell.current ? styles.dimmed : ""}`}
              onClick={() => handleCellClick(dateKey)}
            >
              <div className={styles.cellTop}>
                <span>{cell.day}</span>
                {isToday(cell.date) && <div className={styles.todayIndicator} />}
              </div>
              <div className={styles.cellEvents}>
                {dayEvents.slice(0, 3).map(e => (
                  <div key={e.id} className={styles.miniEvent} style={{ backgroundColor: e.color + '33', borderLeft: `3px solid ${e.color}` }}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className={styles.moreEvents}>+ {dayEvents.length - 3} more</div>}
              </div>
              <div className={styles.addIndicator}>
                <Plus size={14} /> Add Event
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimelineView = (isDayView: boolean) => {
    const startOfWeek = new Date(currentDate);
    const dayOfCurrent = currentDate.getDay();
    const diff = dayOfCurrent === 0 ? -6 : 1 - dayOfCurrent;
    startOfWeek.setDate(currentDate.getDate() + diff);
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const activeDays = isDayView ? [currentDate] : weekDays;
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className={isDayView ? styles.dayTimeline : styles.weekTimeline}>
        {isDayView && (
          <div className={styles.dayViewHero}>
             <div className={styles.heroDateBadge}>
                {currentDate.getDate()}
             </div>
             <div className={styles.heroContent}>
                <h1>{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</h1>
                <p>{events.filter(e => e.date === formatDateKey(currentDate)).length} events scheduled</p>
             </div>
          </div>
        )}

        <div className={styles.timelineHeader}>
          <div className={styles.timeAxisLabel}></div>
          {activeDays.map(d => (
            <div key={d.toString()} className={`${styles.timelineDayColHeader} ${isToday(d) ? styles.active : ""}`}>
              <span className={styles.dayShort}>{DAYS_SHORT[(d.getDay() + 6) % 7]}</span>
              <span className={styles.dayDate}>{d.getDate()}</span>
            </div>
          ))}
        </div>

        <div className={styles.timelineBody}>
          <div className={styles.timeAxis}>
            {hours.map(h => (
              <div key={h} className={styles.timeSlotLabel}>
                {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
              </div>
            ))}
          </div>
          
          <div className={styles.timelineGrid}>
            {activeDays.map(d => {
              const dateKey = formatDateKey(d);
              return (
                <div key={d.toString()} className={styles.timelineDayCol}>
                  {hours.map(h => (
                    <div key={h} className={styles.hourCell} onClick={() => handleCellClick(dateKey, h)} />
                  ))}
                  {events.filter(e => e.date === dateKey).map(evt => {
                    const startH = parseInt(evt.startTime.split(":")[0]);
                    const startM = parseInt(evt.startTime.split(":")[1]);
                    const endH = parseInt(evt.endTime.split(":")[0]);
                    const endM = parseInt(evt.endTime.split(":")[1]);
                    
                    const top = (startH * 60) + startM;
                    const height = ((endH * 60) + endM) - top;

                    return (
                      <div 
                        key={evt.id} 
                        className={styles.eventBlock}
                        style={{
                          backgroundColor: evt.color + '22',
                          borderColor: evt.color,
                          top: `${top}px`,
                          height: `${Math.max(height, 25)}px`
                        }}
                        onClick={(e) => { e.stopPropagation(); handleEditEvent(evt); }}
                      >
                        <div className={styles.eventTitle}>{evt.title}</div>
                        <div className={styles.eventTime}>{evt.startTime} - {evt.endTime}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.navGroup}>
          <div className={styles.arrows}>
            <button onClick={() => navigate(-1)}><ChevronLeft size={20} /></button>
            <button onClick={() => navigate(1)}><ChevronRight size={20} /></button>
          </div>
          <button className={styles.todayBtn} onClick={setToday}>Today</button>
          <h2 className={styles.currentLabel}>
            {viewMode === "day" ? (
              `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
            ) : (
              `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            )}
          </h2>
        </div>

        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <button className={viewMode === "month" ? styles.active : ""} onClick={() => setViewMode("month")}>Month</button>
            <button className={viewMode === "week" ? styles.active : ""} onClick={() => setViewMode("week")}>Week</button>
            <button className={viewMode === "day" ? styles.active : ""} onClick={() => setViewMode("day")}>Day</button>
          </div>
          <button className={styles.addBtn} onClick={openNewEvent}>
            <Plus size={18} /> Event
          </button>
        </div>
      </header>

      <main className={styles.calendarArea}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${currentDate.toString()}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.viewWrapper}
          >
            {viewMode === "month" ? renderMonthView() : renderTimelineView(viewMode === "day")}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modal Integration */}
      <AnimatePresence>
        {modalOpen && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <motion.div 
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>{activeEvent.id ? "Update Event" : "Add Event"}</h3>
                <button className={styles.closeBtn} onClick={() => setModalOpen(false)}><X size={20} /></button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.inputField}>
                  <label>Title</label>
                  <input 
                    type="text" 
                    placeholder="Study session, gym, etc." 
                    value={activeEvent.title || ""}
                    onChange={(e) => setActiveEvent({ ...activeEvent, title: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className={styles.inputField}>
                  <label>Description</label>
                  <textarea 
                    placeholder="Details..."
                    value={activeEvent.description || ""}
                    onChange={(e) => setActiveEvent({ ...activeEvent, description: e.target.value })}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.inputField}>
                    <label>Date</label>
                    <input 
                      type="date" 
                      value={activeEvent.date || ""}
                      onChange={(e) => setActiveEvent({ ...activeEvent, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputField}>
                    <label>Start</label>
                    <input 
                      type="time" 
                      value={activeEvent.startTime || ""}
                      onChange={(e) => setActiveEvent({ ...activeEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div className={styles.inputField}>
                    <label>End</label>
                    <input 
                      type="time" 
                      value={activeEvent.endTime || ""}
                      onChange={(e) => setActiveEvent({ ...activeEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.colorSection}>
                  <label>Color</label>
                  <div className={styles.colorOptions}>
                    {COLORS.map(c => (
                      <button 
                        key={c}
                        className={`${styles.colorCircle} ${activeEvent.color === c ? styles.active : ""}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setActiveEvent({ ...activeEvent, color: c })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                {activeEvent.id && (
                  <button className={styles.deleteAction} onClick={deleteEvent}>
                    <Trash size={16} /> Delete
                  </button>
                )}
                <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancel</button>
                <button 
                  className={styles.saveBtn} 
                  onClick={saveEvent}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
