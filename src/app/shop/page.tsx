"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShoppingBag, Palette, Rocket, Coins, ShieldCheck, Star, Sparkles, X, Check, Type, ArrowLeft, Layout } from "lucide-react";
import styles from "./shop.module.css";
import { SHOP_ITEMS, ShopItem, Rarity } from "@/lib/shopData";

// Direct font-family lookup — bypasses CSS variable resolution issues
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

export default function ShopPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'Nameplates' | 'PFP Decorations' | 'Username Fonts' | 'Boosts' | 'Themes'>('Nameplates');
  const [user, setUser] = useState<{ username: string; avatar?: string } | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);
  const [equippedHistory, setEquippedHistory] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.isLoggedIn) {
          setUser(parsed);
          setUserCoins(parsed.coins || 0);
          setOwnedItems(parsed.inventory || []);
        }
      } catch (e) {
        console.error("Failed to parse local user data", e);
      }
    }

    const savedEquipped = localStorage.getItem("equippedItems");
    if (savedEquipped) {
      setEquippedItems(JSON.parse(savedEquipped));
    } else {
      setEquippedItems(['np-default', 'pfp-default', 'fnt-default', 'thm-default']);
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const savedUser = localStorage.getItem("user");
      let discordId = "";
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        discordId = parsed.discordId;
      }
      
      const url = discordId ? `/api/user?discordId=${discordId}` : '/api/user';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        console.log("[Shop] User data loaded:", data.user);
        setUser(data.user);
        setUserCoins(data.user.coins || 0);
        setOwnedItems(data.user.inventory || []);
        setEquippedHistory(data.user.equippedHistory || []);
        // Keep localStorage in sync
        const localUser = localStorage.getItem("user");
        if (localUser) {
          const parsed = JSON.parse(localUser);
          localStorage.setItem("user", JSON.stringify({ ...parsed, ...data.user }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch user data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'Nameplates', label: 'Nameplates', icon: Palette },
    { id: 'PFP Decorations', label: 'Identity Deco', icon: Sparkles },
    { id: 'Username Fonts', label: 'Typography', icon: Type },
    { id: 'Boosts', label: 'Performance Boosts', icon: Rocket },
    { id: 'Themes', label: 'Global Themes', icon: Layout },
  ] as const;

  const filteredItems = SHOP_ITEMS
    .filter(item => item.section === activeSection)
    .sort((a, b) => {
      if (activeSection === 'Themes') {
        const headingA = a.heading || 'Other';
        const headingB = b.heading || 'Other';
        
        const orderMap: Record<string, number> = {
          'Classics': 1,
          'Shades': 2,
          'Biomes': 3,
          'Anime Series': 4,
        };

        if (headingA !== headingB) {
          const orderA = orderMap[headingA] || 99;
          const orderB = orderMap[headingB] || 99;
          return orderA - orderB;
        }
      }
      return a.price - b.price;
    });

  const equippedFontId = equippedItems.find(id => id.startsWith('fnt-')) || 'fnt-default';
  const equippedFontFamily = FONT_MAP[equippedFontId] || FONT_MAP['fnt-default'];

  const handlePurchase = async () => {
    if (!selectedItem || userCoins < selectedItem.price) return;

    setIsPurchasing(true);
    setError(null);

    let discordId = "";
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      discordId = JSON.parse(savedUser).discordId;
    }

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selectedItem.id, discordId })
      });

      const data = await res.json();

      if (res.ok) {
        setUserCoins(data.coins);
        setOwnedItems(data.inventory);
        
        // Update localStorage to reflect the purchase immediately
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          localStorage.setItem("user", JSON.stringify({ ...parsed, coins: data.coins, inventory: data.inventory }));
        }

        router.push(`/shop/success?itemId=${selectedItem.id}`);
      } else {
        setError(data.error || 'Transaction failed');
      }
    } catch (e) {
      setError('Connection error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleEquip = async (itemId: string, category: string) => {
    // Logic to ensure only one item per category is equipped
    const categoryPrefix =
      category === 'Nameplates' ? 'np-' :
        category === 'PFP Decorations' ? 'pfp-' :
          category === 'Username Fonts' ? 'fnt-' :
            category === 'Themes' ? 'thm-' : 'bst-';
    const otherEquipped = equippedItems.filter(id => !id.startsWith(categoryPrefix));

    let newEquipped = [...equippedItems];

    if (equippedItems.includes(itemId)) {
      // If it's a default item, don't allow unequipping unless another is equipped
      if (itemId.endsWith('-default')) return;
      // Otherwise, revert to default
      const defaultId =
        category === 'Nameplates' ? 'np-default' :
          category === 'PFP Decorations' ? 'pfp-default' :
            category === 'Username Fonts' ? 'fnt-default' :
              category === 'Themes' ? 'thm-default' : '';
      if (defaultId) {
        newEquipped = [...otherEquipped, defaultId];
      }
    } else {
      newEquipped = [...otherEquipped, itemId];
    }

    setEquippedItems(newEquipped);
    localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
    window.dispatchEvent(new Event("equippedItemsUpdated"));

    let discordId = "";
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      discordId = JSON.parse(savedUser).discordId;
    }

    // Save current equipped items
    try {
      await fetch('/api/user/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equippedItems: newEquipped, discordId })
      });
    } catch (e) {
      console.error("Failed to save equipped items", e);
    }

    // Track history in DB
    if (!equippedHistory.includes(itemId)) {
      setEquippedHistory(prev => [...prev, itemId]);
      try {
        await fetch('/api/user/equip-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, discordId })
        });
      } catch (e) {
        console.error("Failed to save history", e);
      }
    }
  };

  const handleReturn = async (itemId: string) => {
    // Moved to dedicated returns page
    router.push('/shop/returns');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap size={48} color="var(--accent)" />
        </motion.div>
        <p>Initializing Store Assets...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-gradient"
          >
            Marathon Store
          </motion.h1>
          <p>Equip the Elite. Accelerate the Grind.</p>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.manageReturnsBtn} onClick={() => router.push('/shop/returns')}>
            <ArrowLeft size={14} style={{ rotate: '180deg' }} /> Returns
          </button>
          <div className={styles.wallet}>
            <span className={styles.priceLabel}>PERSONAL_TREASURY</span>
            <div className={styles.coinDisplay}>
              <img src="/coin.png" alt="Coins" className={styles.coinImg} />
              <span className={styles.coinCount}>{userCoins.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className={styles.tabs}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`${styles.tab} ${activeSection === section.id ? styles.activeTab : ""}`}
          >
            <section.icon size={16} style={{ marginRight: '0.75rem' }} />
            {section.label}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <motion.div
        layout
        className={styles.grid}
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const prevItem = index > 0 ? filteredItems[index - 1] : null;
            const showHeading = activeSection === 'Themes' && item.heading && (!prevItem || prevItem.heading !== item.heading);
            return (
              <React.Fragment key={item.id}>
                {showHeading && (
                  <motion.div layout className={styles.sectionHeadingWrapper}>
                    <h3 className={styles.sectionHeading}>{item.heading}</h3>
                  </motion.div>
                )}
                <motion.div
                  layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -10 }}
              className={styles.itemCard}
            >
              <div className={`${styles.rarityBadge} ${styles['rarity-' + item.rarity]}`}>
                {item.rarity === 'Mythic' && <Sparkles size={10} className={styles.sparkleIcon} />}
                {item.rarity}
              </div>

              <div className={styles.itemPreview}>
                <div
                  className={styles.previewGlow}
                  style={{ background: `var(--rarity-${item.rarity.toLowerCase()})`, opacity: item.rarity === 'Mythic' ? 0.4 : 0.2 }}
                />

                {/* Visual Representations */}
                {item.category === 'Nameplates' && (
                  <div className={`${styles.nameplateMockup} ${styles['effect-' + (item.id.split('-')[1] || 'none')]}`}>
                    {item.id === 'np-dragon' && <div className={styles.dragonEnvironment} />}
                    <div className={styles.nameplateGlow} />
                    <span style={{
                      color: item.rarity === 'Common' ? 'inherit' : `var(--rarity-${item.rarity.toLowerCase()})`,
                      textShadow: item.rarity === 'Legendary' || item.rarity === 'Mythic'
                        ? `0 0 10px var(--rarity-${item.rarity.toLowerCase()})`
                        : 'none',
                      zIndex: 10,
                      position: 'relative',
                      fontFamily: equippedFontFamily
                    }}>
                      {user?.username || 'Productivity Specialist'}
                    </span>
                  </div>
                )}

                {item.category === 'PFP Decorations' && (
                  <div className={styles.pfpMockup}>
                    <div className={styles.pfpCircle}>
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'EP'}&background=00ff9f&color=000`}
                        alt="PFP"
                        className={styles.mockupAvatar}
                      />
                    </div>
                    <div className={`${styles.pfpDecoration} ${styles['pfp-effect-' + (item.id.split('-')[1] || 'none')]}`} />
                  </div>
                )}

                {item.category === 'Banners' && (
                  <div className={styles.bannerMockup}>
                    <div className={`${styles.bannerImage} ${styles['ban-effect-' + (item.id.split('-')[1] || 'none')]}`}>
                      <div className={styles.bannerGlow} />
                    </div>
                  </div>
                )}

                {item.category === 'Rank Effects' && (
                  <div className={styles.rankMockup}>
                    <div className={styles.rankHexagon}>
                      <Star size={20} fill="var(--accent)" />
                    </div>
                    <div className={`${styles.rankEffect} ${styles['re-effect-' + (item.id.split('-')[1] || 'none')]}`} />
                  </div>
                )}

                {activeSection === 'Boosts' && (
                  <div className={styles.boostMockup}>
                    <div className={styles.rocketContainer}>
                      <Rocket size={32} className={styles.boostIcon} />
                    </div>
                    <div className={styles.boostPulse} />
                    <div className={styles.boostLabel}>{item.category}</div>
                  </div>
                )}

                {item.section === 'Themes' && (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '128px', height: '128px', borderRadius: '50%', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))', transform: item.id === 'thm-white-mode' ? 'scale(1.8)' : 'scale(1)' }} />
                  </div>
                )}

                {activeSection === 'Username Fonts' && (
                  <div className={styles.fontMockup} style={{ fontFamily: FONT_MAP[item.id] || FONT_MAP['fnt-default'] }}>
                    <div className={styles.fontPreviewText} style={{ fontFamily: FONT_MAP[item.id] || FONT_MAP['fnt-default'] }}>
                      {user?.username || 'Marathon'}
                    </div>
                    <div className={styles.fontLabel}>{item.name}</div>
                  </div>
                )}

                {ownedItems.includes(item.id) && (
                  <div className={styles.ownedOverlay}>
                    <Check size={48} className={styles.ownedIcon} />
                  </div>
                )}
              </div>

              <h3 className={styles.itemName}>{item.name}</h3>
              <p className={styles.itemDesc}>{item.description}</p>

              <div className={styles.itemFooter}>
                <div className={styles.priceArea}>
                  <span className={styles.priceLabel}>PRICE</span>
                  <div className={styles.priceValue}>
                    <img src="/coin.png" alt="Coin" className={styles.itemCoinImg} />
                    {item.price.toLocaleString()}
                  </div>
                </div>
                {item.section !== 'Boosts' && (ownedItems.includes(item.id) || item.price === 0) ? (
                  <button
                    className={equippedItems.includes(item.id) ? styles.unequipBtn : styles.equipBtn}
                    onClick={() => handleEquip(item.id, item.category)}
                  >
                    {equippedItems.includes(item.id) ? 'UNEQUIP' : 'EQUIP'}
                  </button>
                ) : (
                  <button
                    className={userCoins < item.price ? styles.buyBtnDisabled : styles.buyBtn}
                    onClick={() => userCoins >= item.price && setSelectedItem(item)}
                  >
                    {item.price === 0 ? 'Free' : 'Purchase Item'}
                  </button>
                )}
              </div>
            </motion.div>
            </React.Fragment>
          )})}
        </AnimatePresence>
      </motion.div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className={styles.modalOverlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.modal}
            >
              <button
                className={styles.closeModal}
                onClick={() => !isPurchasing && setSelectedItem(null)}
              >
                <X size={20} />
              </button>

              {purchaseSuccess ? (
                <div className={styles.successState}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={styles.successIcon}
                  >
                    <Check size={48} />
                  </motion.div>
                  <h2 className={styles.modalTitle}>TRANSACTION_COMPLETE</h2>
                  <p className={styles.confirmText}>Item has been added to your inventory.</p>
                </div>
              ) : (
                <>
                  <h2 className={styles.modalTitle}>CONFIRM_ACQUISITION</h2>
                  <div className={styles.modalBody}>
                    <div className={styles.modalItemInfo}>
                      <span className={styles.itemLabel}>{selectedItem.category}</span>
                      <h3 className={styles.modalItemName}>{selectedItem.name}</h3>
                    </div>

                    {error && (
                      <div className={styles.errorMsg}>
                        <X size={14} />
                        {error}
                      </div>
                    )}

                    <div className={styles.balanceCheck}>
                      <div className={styles.balanceItem}>
                        <span>YOUR_BALANCE:</span>
                        <div className={styles.balanceValue}>
                          <img src="/coin.png" alt="Coin" className={styles.modalCoinImg} />
                          {userCoins.toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.balanceItem}>
                        <span>ITEM_COST:</span>
                        <div className={styles.costValue} style={{ color: userCoins < selectedItem.price ? '#ef4444' : 'var(--accent)' }}>
                          <img src="/coin.png" alt="Coin" className={styles.modalCoinImg} />
                          -{selectedItem.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <p className={styles.confirmText}>
                      Authorize the allocation of credits for this acquisition?
                    </p>

                    <div className={styles.modalActions}>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => setSelectedItem(null)}
                        disabled={isPurchasing}
                      >
                        ABORT
                      </button>
                      <button
                        className={styles.confirmBtn}
                        onClick={handlePurchase}
                        disabled={isPurchasing || userCoins < selectedItem.price}
                      >
                        {isPurchasing ? 'AUTHORIZING...' : userCoins < selectedItem.price ? 'INSUFFICIENT_FUNDS' : 'CONFIRM_PURCHASE'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rarity Colors Helper for CSS Variables */}
    </div>
  );
}