import React from 'react';
import shopStyles from '@/app/shop/shop.module.css';

interface DecoratedRowProps {
  equippedItems?: string[];
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function DecoratedRow({ equippedItems = [], className = '', style, children }: DecoratedRowProps) {
  const npDeco = equippedItems.find(id => id.startsWith('np-')) || 'np-default';
  
  if (npDeco === 'np-default') {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const npEffect = npDeco.split('-')[1] || 'none';

  // For Dragon, we need to handle its special clip-path without breaking the row height/width
  const isDragon = npDeco === 'np-dragon';

  return (
    <div 
      className={`${className} ${shopStyles['effect-' + npEffect]}`} 
      style={{
        ...style,
        ...(isDragon ? { width: '100%', height: 'auto', clipPath: 'none', padding: '0.75rem 1.5rem' } : {}),
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isDragon && <div className={shopStyles.dragonEnvironment} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />}
      
      {/* Background glow for all nameplates */}
      <div className={shopStyles.nameplateGlow} style={{ zIndex: 0 }} />
      
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'space-between' }}>
        {children}
      </div>
    </div>
  );
}
