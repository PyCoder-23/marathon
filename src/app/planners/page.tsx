"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "./planners.module.css";
import {
  ArrowLeft,
  Calendar,
  Layout,
  Clock,
  Printer
} from "lucide-react";

type PlannerType = "daily" | "weekly" | "monthly" | null;

export default function PlannersPage() {
  const [selectedType, setSelectedType] = useState<PlannerType>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentDateLabel, setCurrentDateLabel] = useState("");

  useEffect(() => {
    const d = new Date(startDate);
    setCurrentDateLabel(d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }));
  }, [startDate]);

  const handleDownload = () => {
    window.print();
  };

  const renderSelection = () => (
    <div className={styles.selectionArea}>
      <header className={styles.header}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-label"
        >
          Productivity Tools
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gradient"
        >
          Printable Planners
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Design your perfect day, week, or month. Edit on-screen and save as a high-quality,
          lightweight PDF ready for printing.
        </motion.p>
      </header>

      <div className={styles.plannerGrid}>
        {[
          { id: "daily", title: "Daily Focus", icon: <Clock size={32} />, desc: "2-Page spread covering a full 24h schedule, priority tasks, and reflections." },
          { id: "weekly", title: "Weekly Tracker", icon: <Layout size={32} />, desc: "Complete week layout with integrated habit tracking and goals." },
          { id: "monthly", title: "Monthly Planner", icon: <Calendar size={32} />, desc: "A full month calendar followed by a deep-dive review and planning page." },
        ].map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={styles.plannerCard}
            onClick={() => setSelectedType(item.id as PlannerType)}
          >
            <div className={styles.iconWrapper}>
              {item.icon}
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <button className={`${styles.downloadBtn} ${styles.primaryBtn}`} style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
              Select Template
            </button>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={styles.purposeSection}
      >
        <div className={styles.purposeHeader}>
          <div className={styles.dividerSimple} />
          <h2>Why Print?</h2>
          <div className={styles.dividerSimple} />
        </div>
        <div className={styles.purposeGrid}>
          <div className={styles.purposeItem}>
            <h4>Choose Handwriting Over Typing</h4>
            <p>We recommend downloading an <strong>empty planner</strong> and writing your goals manually. Handwriting improves memory retention and makes your intentions feel real. However, if you prefer digital entry, you can type directly on the sheets.</p>
          </div>
          <div className={styles.purposeItem}>
            <h4>Zero Distractions</h4>
            <p>Unlike digital apps with notifications, paper demands your full focus. No tabs, no popups—just you and your deep work session.</p>
          </div>
          <div className={styles.purposeItem}>
            <h4>Constant Visibility</h4>
            <p>Keep your planner open on your desk. It stays visible all day, serving as a physical reminder of your priorities that won't get buried under browser windows.</p>
          </div>
          <div className={styles.purposeItem}>
            <h4>Reduced Screen Fatigue</h4>
            <p>Give your eyes a break. Planning on paper provides a tactile, analog bridge to your digital workday, reducing stress and eye strain.</p>
          </div>
        </div>
      </motion.section>
    </div>
  );

  const renderWeeklyPlanner = () => {
    let start = new Date(startDate);
    if (isNaN(start.getTime())) start = new Date();
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        name: d.toLocaleDateString('en-US', { weekday: 'long' }),
        date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      };
    });

    return (
      <div className={styles.plannerContent}>
        <div className={styles.plannerTitle}>
          <h1 contentEditable suppressContentEditableWarning>WEEKLY PLANNER</h1>
          <p>Week Beginning: {startDate}</p>
        </div>

        <div className={styles.weeklyGrid}>
          {days.map((day, i) => (
            <div key={i} className={styles.dayBox}>
              <div className={styles.dayHeader}>
                <div className={styles.dayName}>{day.name}</div>
                <div className={styles.dayDate} contentEditable suppressContentEditableWarning>{day.date}</div>
              </div>
              <div className={styles.dayNotes} contentEditable suppressContentEditableWarning />
            </div>
          ))}
        </div>

        <div className={styles.bottomSections} style={{ height: '65mm' }}>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>To-Do List</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Goals for the week</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Priorities</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
        </div>

        <div className={styles.plannerTrademark}>
          © MARATHON PRODUCTIVITY • DESIGNED FOR EFFORTLESS CONSISTENCY
        </div>
      </div>
    );
  };

  const renderWeeklySecondary = () => (
    <div className={styles.plannerContent}>
      <div className={styles.plannerTitle}>
        <h1 contentEditable suppressContentEditableWarning>WEEKLY TRACKER</h1>
        <p contentEditable suppressContentEditableWarning>Habits, Notes & Reflections</p>
      </div>

      <div className={styles.weeklyExtraGrid}>
        <div className={styles.sectionBox} style={{ flex: 1.8 }}>
          <div className={styles.sectionHeader}>Weekly Habit Tracker</div>
          <div className={styles.sectionContent}>
            <div className={styles.habitGridLarge}>
              <div className={styles.habitGridHeader}>
                <div className={styles.habitLabel}>Activity</div>
                <div className={styles.habitDays}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
                </div>
              </div>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={styles.habitRowLarge}>
                  <div className={styles.habitLabelInput} contentEditable suppressContentEditableWarning />
                  <div className={styles.habitCheckboxesLarge}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className={styles.checkboxSquare} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.sectionBox} style={{ flex: 1 }}>
          <div className={styles.sectionHeader}>Major Projects / Milestones</div>
          <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
        </div>
      </div>

      <div className={styles.bottomSections} style={{ height: '50mm' }}>
        <div className={styles.sectionBox} style={{ gridColumn: 'span 1' }}>
          <div className={styles.sectionHeader}>Notes</div>
          <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
        </div>
        <div className={styles.sectionBox} style={{ gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>Weekly Reflections & Gratitude</div>
          <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
        </div>
      </div>
      <div className={styles.plannerTrademark}>
        © MARATHON PRODUCTIVITY • DESIGNED FOR EFFORTLESS CONSISTENCY
      </div>
    </div>
  );

  const renderDailyPlanner = (page: 1 | 2) => {
    const times = page === 1
      ? ["5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"]
      : ["5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM", "1 AM", "2 AM", "3 AM", "4 AM"];

    return (
      <div className={styles.plannerContent}>
        <div className={styles.plannerTitle}>
          <h1 contentEditable suppressContentEditableWarning>DAILY FOCUS {page === 2 && "(PAGE 2)"}</h1>
          <p contentEditable suppressContentEditableWarning>{currentDateLabel} • {page === 1 ? "Start Strong" : "Reflect & Recover"}</p>
        </div>

        <div className={styles.dailyLayout}>
          <div className={styles.schedule}>
            {times.map(time => (
              <div key={time} className={styles.scheduleRow}>
                <div className={styles.timeLabel}>{time}</div>
                <div className={styles.timeContent} contentEditable suppressContentEditableWarning />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5mm' }}>
            {page === 1 ? (
              <>
                <div className={styles.sectionBox} style={{ height: '40%' }}>
                  <div className={styles.sectionHeader}>Top Priorities</div>
                  <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
                </div>
                <div className={styles.sectionBox} style={{ height: '30%' }}>
                  <div className={styles.sectionHeader}>Quick Wins</div>
                  <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
                </div>
                <div className={styles.sectionBox} style={{ height: '25%' }}>
                  <div className={styles.sectionHeader}>Morning Intention</div>
                  <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
                </div>
              </>
            ) : (
              <>
                <div className={styles.sectionBox} style={{ height: '35%' }}>
                  <div className={styles.sectionHeader}>Daily Habit Tracker</div>
                  <div className={styles.sectionContent}>
                    <div className={styles.habitGrid} style={{ padding: '2mm' }}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={styles.habitRow}>
                          <div className={styles.habitLabel} contentEditable suppressContentEditableWarning />
                          <div className={styles.checkbox} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.sectionBox} style={{ height: '35%' }}>
                  <div className={styles.sectionHeader}>Brain Dump / Ideas</div>
                  <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
                </div>
                <div className={styles.sectionBox} style={{ height: '25%' }}>
                  <div className={styles.sectionHeader}>Evening Reflection</div>
                  <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.plannerTrademark}>
          © MARATHON PRODUCTIVITY • DESIGNED FOR EFFORTLESS CONSISTENCY
        </div>
      </div>
    );
  };

  const renderMonthlyPlanner = () => {
    const d = new Date(startDate);
    const month = d.getMonth();
    const year = d.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'long' });

    // Adjust first day to Monday start (0=Mon, 6=Sun)
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    return (
      <div className={styles.plannerContent}>
        <div className={styles.plannerTitle}>
          <h1 contentEditable suppressContentEditableWarning>{monthName.toUpperCase()} CALENDAR</h1>
          <p contentEditable suppressContentEditableWarning>{year} OVERVIEW</p>
        </div>

        <div className={styles.monthlyCalendar}>
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
            <div key={d} className={styles.calendarDayHeader}>{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNum = i - startOffset + 1;
            const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
            return (
              <div key={i} className={`${styles.calendarCell} ${!isCurrentMonth ? styles.cellEmpty : ""}`}>
                {isCurrentMonth && <div className={styles.cellNumber}>{dayNum}</div>}
                <div className={styles.cellSpace} contentEditable suppressContentEditableWarning />
              </div>
            );
          })}
        </div>

        <div className={styles.bottomSections} style={{ height: '30mm' }}>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Key Deadlines</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Monthly Focus</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
        </div>
        <div className={styles.plannerTrademark}>
          © MARATHON PRODUCTIVITY • DESIGNED FOR EFFORTLESS CONSISTENCY
        </div>
      </div>
    );
  };

  const renderMonthlyTracker = () => {
    const d = new Date(startDate);
    const monthName = d.toLocaleDateString('en-US', { month: 'long' });

    return (
      <div className={styles.plannerContent}>
        <div className={styles.plannerTitle}>
          <h1 contentEditable suppressContentEditableWarning>{monthName.toUpperCase()} REVIEW</h1>
          <p contentEditable suppressContentEditableWarning>Growth & Metrics</p>
        </div>

        <div className={styles.bottomSections} style={{ flex: 1, gridTemplateColumns: '1fr 1fr' }}>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Primary Goals</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Major Projects</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
        </div>

        <div className={styles.bottomSections} style={{ flex: 1.5, gridTemplateColumns: '1.5fr 1fr' }}>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Notes & Observations</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>Growth Areas</div>
            <div className={styles.sectionContent} contentEditable suppressContentEditableWarning />
          </div>
        </div>

        <div style={{ padding: '5mm', border: '1.5pt solid #000', borderRadius: '4px' }}>
          <h4 style={{ textTransform: 'uppercase', marginBottom: '2mm', fontSize: '10pt' }}>Monthly Rating</h4>
          <div style={{ display: 'flex', gap: '5mm' }}>
            {["Discipline", "Focus", "Wellbeing", "Social", "Learning"].map(item => (
              <div key={item} style={{ flex: 1 }}>
                <div style={{ fontSize: '8pt', marginBottom: '1mm' }}>{item}</div>
                <div style={{ height: '4mm', border: '1pt solid #000' }} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.plannerTrademark}>
          © MARATHON PRODUCTIVITY • DESIGNED FOR EFFORTLESS CONSISTENCY
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className={styles.container}>
        {!selectedType ? (
          renderSelection()
        ) : (
          <div className={styles.editorArea}>
            <div className={styles.editorHeader}>
              <div className={styles.editorLeft}>
                <button
                  className={styles.backBtn}
                  onClick={() => setSelectedType(null)}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div className={styles.datePickerGroup}>
                  <label>{selectedType === "weekly" ? "Week Beginning:" : "Date:"}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
              </div>

              <div className={styles.editorActions}>
                <div className={styles.pageBadge}>2-Page Spread</div>
                <div className={styles.divider} />
                <button className={styles.resetBtn} onClick={() => window.location.reload()}>
                  Reset All
                </button>
                <button className={styles.downloadBtn} onClick={handleDownload}>
                  <Printer size={18} /> Download as PDF
                </button>
              </div>
            </div>

            <div className={styles.plannerWrapper}>
              <motion.div
                className={styles.a4Sheet}
                initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateX: 8 }}
                transition={{ duration: 0.5 }}
              >
                {selectedType === "weekly" && renderWeeklyPlanner()}
                {selectedType === "daily" && renderDailyPlanner(1)}
                {selectedType === "monthly" && renderMonthlyPlanner()}
              </motion.div>

              <motion.div
                className={styles.a4Sheet}
                initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateX: 8 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {selectedType === "weekly" && renderWeeklySecondary()}
                {selectedType === "daily" && renderDailyPlanner(2)}
                {selectedType === "monthly" && renderMonthlyTracker()}
              </motion.div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
              Tip: Click on any text area to edit. The "Download PDF" button will open your print dialog - select "Save as PDF".
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
