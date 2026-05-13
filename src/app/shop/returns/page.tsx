"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle, Coins, Package, Clock } from "lucide-react";
import styles from "./returns.module.css";
import { SHOP_ITEMS, ShopItem } from "@/lib/shopData";

export default function ReturnsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [returnableItems, setReturnableItems] = useState<ShopItem[]>([]);
  const [ineligibleItems, setIneligibleItems] = useState<{item: ShopItem, reason: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/user', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        const inventory = data.user.inventory || [];
        const history = data.user.equippedHistory || [];
        
        const returnable: ShopItem[] = [];
        const ineligible: {item: ShopItem, reason: string}[] = [];

        // Group inventory by ID for easier processing
        const itemCounts: Record<string, number> = {};
        inventory.forEach((id: string) => {
          itemCounts[id] = (itemCounts[id] || 0) + 1;
        });

        Object.keys(itemCounts).forEach(id => {
          const item = SHOP_ITEMS.find(i => i.id === id);
          if (!item) return;

          if (item.section === 'Boosts') {
            ineligible.push({ item, reason: 'Boosts are non-refundable' });
          } else if (history.includes(id)) {
            ineligible.push({ item, reason: 'Item has been equipped previously' });
          } else if (item.price === 0) {
            ineligible.push({ item, reason: 'Free items cannot be returned' });
          } else {
            // Add as many instances as owned
            for(let i=0; i < itemCounts[id]; i++) {
                returnable.push(item);
            }
          }
        });

        setReturnableItems(returnable);
        setIneligibleItems(ineligible);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (itemId: string) => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/shop/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `Successfully returned! ${data.coins.toLocaleString()} coins credited back.`, type: 'success' });
        // Refresh local data
        fetchData();
        // Update localStorage
        const localUser = localStorage.getItem("user");
        if (localUser) {
          const parsed = JSON.parse(localUser);
          localStorage.setItem("user", JSON.stringify({ ...parsed, coins: data.coins }));
        }
      } else {
        setMessage({ text: data.error || 'Return failed', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Network error occurred.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <RotateCcw size={40} color="var(--accent)" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.push('/shop')} className={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Store
        </button>
        <h1 className="text-gradient">Returns & Refunds</h1>
        <p>Return unequipped items for a full credit to your treasury.</p>
      </div>

      <div className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Package size={20} />
            <h2>Returnable Inventory</h2>
            <span className={styles.countBadge}>{returnableItems.length}</span>
          </div>

          <div className={styles.grid}>
            {returnableItems.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={48} opacity={0.2} />
                <p>No eligible items found in your inventory.</p>
              </div>
            ) : (
              returnableItems.map((item, idx) => (
                <motion.div 
                  key={`${item.id}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.itemCard}
                >
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className={styles.refundAmount}>
                      <Coins size={14} />
                      <span>+{item.price.toLocaleString()} Refund</span>
                    </div>
                  </div>
                  <button 
                    className={styles.processBtn}
                    onClick={() => handleReturn(item.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Process Refund'}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={20} color="#ffaa00" />
            <h2>Ineligible Items</h2>
          </div>
          <div className={styles.ineligibleList}>
            {ineligibleItems.map(({item, reason}, idx) => (
              <div key={idx} className={styles.ineligibleItem}>
                <div className={styles.ineligibleInfo}>
                  <strong>{item.name}</strong>
                  <span>{reason}</span>
                </div>
                <div className={styles.ineligibleBadge}>Non-Refundable</div>
              </div>
            ))}
            {ineligibleItems.length === 0 && (
              <p className={styles.mutedText}>No ineligible items in your history.</p>
            )}
          </div>
        </section>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${styles.toast} ${styles[message.type]}`}
        >
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {message.text}
          <button onClick={() => setMessage(null)} className={styles.closeToast}>×</button>
        </motion.div>
      )}
    </div>
  );
}
