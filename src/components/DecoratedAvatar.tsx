import React from 'react';
import shopStyles from '@/app/shop/shop.module.css';

interface DecoratedAvatarProps {
  avatar?: string;
  username: string;
  equippedItems?: string[];
  size?: number;
}

export default function DecoratedAvatar({ avatar, username, equippedItems = [], size = 40 }: DecoratedAvatarProps) {
  const pfpDeco = equippedItems.find(id => id.startsWith('pfp-')) || 'pfp-default';
  const effectName = pfpDeco.split('-')[1] || 'none';

  return (
    <div className={shopStyles.pfpMockup} style={{ width: size, height: size, flexShrink: 0 }}>
      <div className={shopStyles.pfpCircle} style={{ width: '100%', height: '100%' }}>
        <img
          src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=00ff9f&color=000`}
          alt={username}
          className={shopStyles.mockupAvatar}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className={`${shopStyles.pfpDecoration} ${shopStyles['pfp-effect-' + effectName]}`} />
    </div>
  );
}
