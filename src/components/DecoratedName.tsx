import React from 'react';
import shopStyles from '@/app/shop/shop.module.css';
import { SHOP_ITEMS } from '@/lib/shopData';

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

interface DecoratedNameProps {
  username: string;
  equippedItems?: string[];
  className?: string;
  type?: 'full' | 'font-only';
}

export default function DecoratedName({ username, equippedItems = [], className = '', type = 'full' }: DecoratedNameProps) {
  const npDeco = equippedItems.find(id => id.startsWith('np-')) || 'np-default';
  const fntDeco = equippedItems.find(id => id.startsWith('fnt-')) || 'fnt-default';
  
  const npEffect = npDeco.split('-')[1] || 'none';
  const fontFam = FONT_MAP[fntDeco] || FONT_MAP['fnt-default'];
  
  const npItem = SHOP_ITEMS.find(i => i.id === npDeco);
  const rarity = npItem?.rarity || 'Common';

  const textStyle = {
    color: rarity === 'Common' ? 'inherit' : `var(--rarity-${rarity.toLowerCase()})`,
    textShadow: rarity === 'Legendary' || rarity === 'Mythic'
      ? `0 0 10px var(--rarity-${rarity.toLowerCase()})`
      : 'none',
    zIndex: 10,
    position: 'relative' as any,
    fontFamily: fontFam
  };

  if (type === 'font-only') {
    return (
      <span className={className} style={textStyle}>
        {username}
      </span>
    );
  }

  if (npDeco === 'np-default') {
    return (
      <span className={className} style={{ fontFamily: fontFam }}>
        {username}
      </span>
    );
  }

  return (
    <div className={`${shopStyles.nameplateMockup} ${shopStyles['effect-' + npEffect]} ${className}`} style={{ height: 'auto', padding: '2px 8px', width: 'auto', display: 'inline-flex' }}>
      {npDeco === 'np-dragon' && <div className={shopStyles.dragonEnvironment} />}
      <div className={shopStyles.nameplateGlow} />
      <span style={textStyle}>
        {username}
      </span>
    </div>
  );
}
