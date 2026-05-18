"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Rocket, Sparkles, Palette, Type, ChevronLeft, Zap } from "lucide-react";
import styles from "./success.module.css";
import shopStyles from "../shop.module.css";
import { SHOP_ITEMS, ShopItem } from "@/lib/shopData";

const FONT_MAP: Record<string, string> = {
  'fnt-default':    "'JetBrains Mono', monospace",
  'fnt-inter':      "'Inter', sans-serif",
  'fnt-roboto':     "'Roboto', sans-serif",
  'fnt-montserrat': "'Montserrat', sans-serif",
  'fnt-lato':       "'Lato', sans-serif",
  'fnt-oswald':     "'Oswald', sans-serif",
  'fnt-source':     "'Source Code Pro', monospace",
  'fnt-open':       "'Open Sans', sans-serif",
  'fnt-bebas':      "'Bebas Neue', cursive",
  'fnt-playfair':   "'Playfair Display', serif",
  'fnt-space':      "'Space Grotesk', sans-serif",
  'fnt-syne':       "'Syne', sans-serif",
  'fnt-orbitron':   "'Orbitron', sans-serif",
  'fnt-righteous':  "'Righteous', cursive",
  'fnt-cinzel':     "'Cinzel', serif",
  'fnt-uncial':     "'Uncial Antiqua', serif",
  'fnt-press':      "'Press Start 2P', cursive",
  'fnt-metal':      "'Metal Mania', cursive",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");
  const [item, setItem] = useState<ShopItem | null>(null);
  const [user, setUser] = useState<{ username: string; avatar?: string } | null>(null);
  const [isEquipping, setIsEquipping] = useState(false);
  const [isEquipped, setIsEquipped] = useState(false);

  useEffect(() => {
    if (itemId) {
      const foundItem = SHOP_ITEMS.find((i) => i.id === itemId);
      setItem(foundItem || null);
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, [itemId]);

  const handleEquip = () => {
    if (!item) return;
    setIsEquipping(true);
    
    // Logic to ensure only one item per category is equipped (matching ShopPage)
    const category = item.category;
    const categoryPrefix =
      category === 'Nameplates' ? 'np-' :
        category === 'PFP Decorations' ? 'pfp-' :
          category === 'Username Fonts' ? 'fnt-' : 'bst-';

    const savedEquipped = localStorage.getItem("equippedItems");
    let equippedList = savedEquipped ? JSON.parse(savedEquipped) : ['np-default', 'pfp-default', 'fnt-default'];
    
    // Filter out existing item in same category
    equippedList = equippedList.filter((id: string) => !id.startsWith(categoryPrefix));
    // Add new item
    equippedList.push(item.id);
    
    // Save back
    localStorage.setItem("equippedItems", JSON.stringify(equippedList));

    let discordId = "";
    if (user) {
      discordId = (user as any).discordId;
    }

    // Save current equipped items to DB
    fetch('/api/user/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equippedItems: equippedList, discordId })
    }).catch(e => console.error("Failed to save equipped items", e));

    // Track history in DB
    fetch('/api/user/equip-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, discordId })
    }).catch(e => console.error("Failed to save history", e));

    // Simulating API latency
    setTimeout(() => {
      setIsEquipping(false);
      setIsEquipped(true);
    }, 800);
  };

  if (!item) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Item Not Found</h2>
          <button className={styles.backBtn} onClick={() => router.push("/shop")}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successGlow} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.card}
      >
        <div className={styles.header}>
          <span className={styles.thankYouText}>Acquisition Successful</span>
          <h1 className={styles.title}>Thank You For Your Purchase</h1>
        </div>

        <div className={styles.previewContainer}>
          <div
            className={styles.itemPreviewGlow}
            style={{ background: `var(--rarity-${item.rarity.toLowerCase()})` }}
          />

          {/* Visual Representations (Reused from ShopPage with success-specific styling) */}
          {item.category === 'Nameplates' && (
            <div className={`${shopStyles.nameplateMockup} ${shopStyles['effect-' + (item.id.split('-')[1] || 'none')]}`} style={{ scale: 1.5 }}>
               {item.id === 'np-dragon' && <div className={shopStyles.dragonEnvironment} />}
               <div className={shopStyles.nameplateGlow} />
               <span style={{
                 color: item.rarity === 'Common' ? 'inherit' : `var(--rarity-${item.rarity.toLowerCase()})`,
                 textShadow: item.rarity === 'Legendary' || item.rarity === 'Mythic'
                   ? `0 0 15px var(--rarity-${item.rarity.toLowerCase()})`
                   : 'none',
                 zIndex: 10,
                 position: 'relative',
                 fontSize: '0.9rem'
               }}>
                 {user?.username || 'Marathoner'}
               </span>
            </div>
          )}

          {item.category === 'PFP Decorations' && (
            <div className={styles.pfpMockup} style={{ scale: 1.5 }}>
              <div className={styles.pfpCircle}>
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'EP'}&background=00ff9f&color=000`}
                  alt="PFP"
                  className={styles.mockupAvatar}
                />
              </div>
              <div className={`${shopStyles.pfpDecoration} ${shopStyles['pfp-effect-' + (item.id.split('-')[1] || 'none')]}`} />
            </div>
          )}

          {item.section === 'Username Fonts' && (
             <div className={styles.fontPreviewText} style={{ fontFamily: FONT_MAP[item.id] || FONT_MAP['fnt-default'] }}>
               {user?.username || 'Marathoner'}
             </div>
          )}

          {item.section === 'Boosts' && (
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Rocket size={80} className={styles.boostIcon} />
            </motion.div>
          )}
        </div>

        <h3 className={styles.itemName}>{item.name}</h3>
        <span className={styles.itemCategory}>{item.category}</span>

        <div className={styles.actions}>
          <button 
            className={styles.equipBtn} 
            onClick={handleEquip}
            disabled={isEquipped || item.section === 'Boosts'}
          >
            {isEquipped ? 'Equipped' : isEquipping ? 'Processing...' : 'Equip Now'}
          </button>
          <button className={styles.backBtn} onClick={() => router.push("/shop")}>
            Back to Shop
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
