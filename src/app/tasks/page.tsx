"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, X, CheckSquare, Square } from "lucide-react";
import { useState, useEffect } from "react";
import styles from "./tasks.module.css";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [user, setUser] = useState<{ discordId: string; username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/join");
      return;
    }
    const usr = JSON.parse(saved);
    setUser(usr);
    fetchTasks(usr.discordId);
  }, []);

  const fetchTasks = async (discordId: string) => {
    try {
      const res = await fetch(`/api/tasks?discordId=${discordId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() && user) {
      const title = newTask.trim();
      setNewTask("");
      
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discordId: user.discordId, title })
        });
        if (res.ok) fetchTasks(user.discordId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));
      
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, isCompleted: !task.isCompleted })
      });
    } catch (err) {
      console.error(err);
      // Revert if error
      if (user) fetchTasks(user.discordId); 
    }
  };

  const removeTask = async (id: string) => {
    try {
      setTasks(tasks.filter(t => t.id !== id));
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      if (user) fetchTasks(user.discordId);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-gradient">Tasks Protocol</h1>
      </header>
      
      <form onSubmit={addTask} className={styles.addForm}>
        <input 
          type="text" 
          placeholder="ENTER_NEW_TASK..." 
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
        />
        <button type="submit" className="button button-primary">
          <Plus size={18} /> Add Target
        </button>
      </form>

      <div className={styles.taskList}>
        {tasks.length === 0 && (
          <div className={styles.emptyState}>
            <CheckSquare size={40} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
            <h3>NO ACTIVE TASKS</h3>
            <p style={{fontFamily: "monospace"}}>Your queue is currently empty.</p>
          </div>
        )}
        
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div 
              key={task.id} 
              className={styles.taskItem}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              layout
            >
              <div className={styles.leftSide} onClick={() => toggleTask(task)}>
                <div className={`${styles.checkbox} ${task.isCompleted ? styles.checked : ''}`}>
                  {task.isCompleted && <Check size={14} strokeWidth={4} />}
                </div>
                <span className={`${styles.title} ${task.isCompleted ? styles.checked : ''}`}>
                  {task.title}
                </span>
              </div>
              <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}>
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
