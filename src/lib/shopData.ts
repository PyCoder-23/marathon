export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ascendant';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: Rarity;
  category: string;
  section: 'Nameplates' | 'PFP Decorations' | 'Username Fonts' | 'Boosts';
  image?: string;
  effect?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // --- DECORATIONS: Nameplates ---
  {
    id: 'np-default',
    name: 'Standard Issue',
    description: 'The baseline identification plate for all marathoners.',
    price: 0,
    rarity: 'Common',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-neon',
    name: 'Neon Frame',
    description: 'A vibrant pulsing neon border for your name.',
    price: 500,
    rarity: 'Uncommon',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-diamond',
    name: 'Diamond Pulse',
    description: 'Crystalline brilliance that radiates status.',
    price: 1200,
    rarity: 'Rare',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-infernal',
    name: 'Infernal Glow',
    description: 'Forged in the depths of the competitive grind.',
    price: 2500,
    rarity: 'Epic',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-quantum',
    name: 'Quantum Border',
    description: 'A shifting boundary of subatomic particles.',
    price: 3000,
    rarity: 'Epic',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-phantom',
    name: 'Phantom Shift',
    description: 'A ghostly border that fades in and out of reality.',
    price: 3500,
    rarity: 'Epic',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-zenith',
    name: 'Zenith Crown',
    description: 'The ultimate symbol of peak performance.',
    price: 5000,
    rarity: 'Legendary',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-space-legendary',
    name: 'Cosmic Void',
    description: 'A deep space boundary adorned with stars and a crescent moon.',
    price: 10000,
    rarity: 'Legendary',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-titan',
    name: 'Titan Core',
    description: 'The raw power of a planetary engine.',
    price: 6500,
    rarity: 'Legendary',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-glitch',
    name: 'Glitched Matrix',
    description: 'A corrupted stream of raw data packets.',
    price: 4000,
    rarity: 'Legendary',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-arcane',
    name: 'Arcane Sigil',
    description: 'Mystical runes that protect your focus.',
    price: 8000,
    rarity: 'Legendary',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-celestial',
    name: 'Celestial Aura',
    description: 'Blessed by the gods of productivity.',
    price: 3500,
    rarity: 'Epic',
    category: 'Nameplates',
    section: 'Nameplates'
  },
  {
    id: 'np-dragon',
    name: 'Dragon Soul',
    description: 'The fiery breath of a focus legend.',
    price: 12000,
    rarity: 'Mythic',
    category: 'Nameplates',
    section: 'Nameplates'
  },

  // --- DECORATIONS: PFP Decorations ---
  {
    id: 'pfp-default',
    name: 'Basic Circle',
    description: 'A clean, unadorned border for your profile.',
    price: 0,
    rarity: 'Common',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-electric',
    name: 'Electric Ring',
    description: 'High-voltage energy circling your avatar.',
    price: 1000,
    rarity: 'Uncommon',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-crown',
    name: 'Crown Orbit',
    description: 'A spinning crown of orbital satellites.',
    price: 1500,
    rarity: 'Rare',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-holographic',
    name: 'Holographic Halo',
    description: 'A futuristic projection of digital light.',
    price: 3000,
    rarity: 'Epic',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-firestorm',
    name: 'Firestorm Border',
    description: 'Licking flames of pure passion.',
    price: 4500,
    rarity: 'Epic',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-frost',
    name: 'Frost Nova',
    description: 'Sub-zero temperatures to keep you cool.',
    price: 4000,
    rarity: 'Epic',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-corrupted',
    name: 'Corrupted Signal',
    description: 'Static and noise from the outer rim.',
    price: 5000,
    rarity: 'Legendary',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-wings',
    name: 'Digital Wings',
    description: 'Flight data processed in real-time.',
    price: 6500,
    rarity: 'Legendary',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-golden',
    name: 'Golden Pulse',
    description: 'The heartbeat of a champion.',
    price: 6000,
    rarity: 'Legendary',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-obsidian',
    name: 'Obsidian Shards',
    description: 'Dark volcanic glass revolving in harmony.',
    price: 7000,
    rarity: 'Legendary',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-cosmic',
    name: 'Cosmic Reactor',
    description: 'The power of a dying star, contained.',
    price: 10000,
    rarity: 'Mythic',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },
  {
    id: 'pfp-void',
    name: 'Void Singularity',
    description: 'The absolute zero of distractions.',
    price: 15000,
    rarity: 'Mythic',
    category: 'PFP Decorations',
    section: 'PFP Decorations'
  },

  // --- DECORATIONS: Username Fonts ---
  {
    id: 'fnt-default',
    name: 'Monospace Standard',
    description: 'The reliable technical font for all marathoners.',
    price: 0,
    rarity: 'Common',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-inter',
    name: 'Inter Modern',
    description: 'A clean, modern typeface for a minimalist look.',
    price: 800,
    rarity: 'Uncommon',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-roboto',
    name: 'Roboto Steel',
    description: 'Industrial precision in every character.',
    price: 850,
    rarity: 'Uncommon',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-montserrat',
    name: 'Montserrat Bold',
    description: 'Classic geometric elegance for your name.',
    price: 900,
    rarity: 'Uncommon',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-lato',
    name: 'Lato Smooth',
    description: 'A balanced and friendly presentation.',
    price: 950,
    rarity: 'Uncommon',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-oswald',
    name: 'Oswald Compressed',
    description: 'Vertical authority for a commanding presence.',
    price: 1000,
    rarity: 'Uncommon',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-source',
    name: 'Source Code',
    description: 'The hacker-elite aesthetic for developers.',
    price: 1100,
    rarity: 'Uncommon',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-open',
    name: 'Open Sans Clean',
    description: 'The most readable choice for long focus sessions.',
    price: 750,
    rarity: 'Uncommon',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-bebas',
    name: 'Bebas Vanguard',
    description: 'The standard for high-impact esports titles.',
    price: 2500,
    rarity: 'Rare',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-playfair',
    name: 'Playfair Royal',
    description: 'Sophisticated serif styling for the elite.',
    price: 2800,
    rarity: 'Rare',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-space',
    name: 'Space Grotesk',
    description: 'A futuristic twist on a classic design.',
    price: 3000,
    rarity: 'Rare',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-syne',
    name: 'Syne Artistic',
    description: 'Experimental and bold, for the unique.',
    price: 3200,
    rarity: 'Rare',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-orbitron',
    name: 'Orbitron Command',
    description: 'Straight from the starship bridge.',
    price: 5500,
    rarity: 'Epic',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-righteous',
    name: 'Righteous Wave',
    description: 'Retro-futuristic vibes with a clean edge.',
    price: 6000,
    rarity: 'Epic',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-cinzel',
    name: 'Cinzel Decorative',
    description: 'Inspired by ancient Roman inscriptions.',
    price: 6500,
    rarity: 'Epic',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-uncial',
    name: 'Uncial Antiqua',
    description: 'Ancient mystical scrolls in digital form.',
    price: 9000,
    rarity: 'Legendary',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-press',
    name: 'Press Start Retro',
    description: '8-bit nostalgia for the pixel pioneers.',
    price: 9500,
    rarity: 'Legendary',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },
  {
    id: 'fnt-metal',
    name: 'Metal Mania',
    description: 'The ultimate dark-prestige typography.',
    price: 15000,
    rarity: 'Mythic',
    category: 'Username Fonts',
    section: 'Username Fonts'
  },

  // --- BOOSTS: XP Multipliers ---
  {
    id: 'bst-2x-week',
    name: '2x XP Weekly Rush',
    description: 'A permanent 2x personal XP multiplier that lasts the entire week until the Sunday hard reset.',
    price: 30000,
    rarity: 'Mythic',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-sabotage',
    name: 'Sabotage',
    description: 'Target another user and instantly halve their weekly XP. A cruel but effective tactic.',
    price: 50000,
    rarity: 'Mythic',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-10x-global',
    name: 'The Global Catalyst',
    description: 'Secretly triggers a GLOBAL 10x XP multiplier for 1 hour. Anyone who ends their session during this hidden hour receives the multiplier.',
    price: 75000,
    rarity: 'Ascendant',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-2x-sess',
    name: '2x XP Session Boost',
    description: 'Applies 2x XP to ONE session only.',
    price: 2000,
    rarity: 'Rare',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-1.5x-hour',
    name: '1.5x XP Hour Boost',
    description: 'Applies 1.5x XP for 1 hour of activity.',
    price: 1200,
    rarity: 'Rare',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-2x-day',
    name: '2x XP Daily Rush',
    description: 'Double XP for the entire 24-hour period.',
    price: 5000,
    rarity: 'Legendary',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-mini-sabotage',
    name: 'Mini-Sabotage',
    description: 'Use this boost to deduct 50 XP from any user. (Team Only)',
    price: 750,
    rarity: 'Uncommon',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-purple-fever',
    name: 'Purple Fever',
    description: 'A special sabotage. Target loses 200 XP, and the next 3 people they send coins to also lose 50 XP each. (Team Only)',
    price: 4500,
    rarity: 'Epic',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-anti-viral',
    name: 'Anti-Viral',
    description: 'Protects you from any kind of sabotage for 24 hours. (Team Only)',
    price: 6000,
    rarity: 'Legendary',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-vampire',
    name: 'Vampire',
    description: 'Reduce another user\'s total XP by half, but your own XP gets reset to 0. (Team Only)',
    price: 40000,
    rarity: 'Mythic',
    category: 'XP Multipliers',
    section: 'Boosts'
  },
  {
    id: 'bst-xp-generator',
    name: 'XP Generator',
    description: 'Doubles the XP multiplier for your entire squad until the Sunday weekly hard reset. (Team Only)',
    price: 100000,
    rarity: 'Ascendant',
    category: 'XP Multipliers',
    section: 'Boosts'
  },

  // --- BOOSTS: Streak Protection ---
  {
    id: 'bst-streak-prot',
    name: 'Streak Protection',
    description: 'Protects one missed daily consistency day. (1/week)',
    price: 2500,
    rarity: 'Epic',
    category: 'Streak Protection',
    section: 'Boosts'
  },


  // --- BOOSTS: Events ---
  {
    id: 'bst-wr-amp',
    name: 'Weekend Rush Amplifier',
    description: 'Gain additional bonus XP during Weekend Rush.',
    price: 4000,
    rarity: 'Legendary',
    category: 'Events',
    section: 'Boosts'
  },
  {
    id: 'bst-sq-boost',
    name: 'Squad Contribution Booster',
    description: 'Temporarily increases your squad XP multiplier.',
    price: 7500,
    rarity: 'Mythic',
    category: 'Events',
    section: 'Boosts'
  }
];
