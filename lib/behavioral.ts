export interface SwapTransaction {
  signature: string;
  timestamp: number;
  tokenIn: string;
  tokenInSymbol: string;
  tokenOut: string;
  tokenOutSymbol: string;
  amountUsd: number;
  type: 'buy' | 'sell';
  priceChangeAt?: number; // % price change of token at time of trade
  msSincePrevTrade?: number;
  prevTradeWasLoss?: boolean;
}

export type PersonalityType =
  | 'emotional-degen'
  | 'calculated-sniper'
  | 'narrative-chaser'
  | 'diamond-phantom'
  | 'revenge-trader'
  | 'contrarian';

export interface BehavioralPattern {
  id: string;
  name: string;
  emoji: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface BehavioralAnalysis {
  fomoScore: number;
  panicSellScore: number;
  revengeTradeScore: number;
  diamondHandScore: number;
  narrativeChaserScore: number;
  overallRiskScore: number;
  personalityType: PersonalityType;
  totalSwaps: number;
  totalVolumeUsd: number;
  avgHoldTimeDays: number;
  topPatterns: BehavioralPattern[];
  walletAddress: string;
  analyzedAt: number;
}

export interface PersonalityConfig {
  id: PersonalityType;
  label: string;
  emoji: string;
  tagline: string;
  gradient: string;
  textColor: string;
  borderColor: string;
  traits: string[];
  weakness: string;
  strength: string;
}

export const PERSONALITY_CONFIGS: Record<PersonalityType, PersonalityConfig> = {
  'emotional-degen': {
    id: 'emotional-degen',
    label: 'The Emotional Degen',
    emoji: '🔥',
    tagline: 'Heart before head, every time.',
    gradient: 'from-red-900 via-orange-800 to-red-900',
    textColor: 'text-orange-300',
    borderColor: 'border-orange-500',
    traits: ['FOMO buyer', 'Panic seller', 'High volatility lover'],
    weakness: 'Buys tops, sells bottoms',
    strength: 'Never misses a hot narrative',
  },
  'calculated-sniper': {
    id: 'calculated-sniper',
    label: 'The Calculated Sniper',
    emoji: '🎯',
    tagline: 'Patience is your edge.',
    gradient: 'from-emerald-900 via-green-800 to-teal-900',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500',
    traits: ['Patient accumulator', 'Data-driven', 'Low trade frequency'],
    weakness: 'Misses fast-moving opportunities',
    strength: 'Consistently profitable long-term',
  },
  'narrative-chaser': {
    id: 'narrative-chaser',
    label: 'The Narrative Chaser',
    emoji: '📡',
    tagline: 'Always surfing the next wave.',
    gradient: 'from-yellow-900 via-amber-800 to-yellow-900',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500',
    traits: ['Trend follower', 'Twitter-driven', 'Fast rotator'],
    weakness: 'Always late to the party',
    strength: 'Great at spotting emerging trends',
  },
  'diamond-phantom': {
    id: 'diamond-phantom',
    label: 'The Diamond Phantom',
    emoji: '💎',
    tagline: 'Hands of steel, mind of ice.',
    gradient: 'from-blue-900 via-violet-800 to-purple-900',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-500',
    traits: ['Long-term holder', 'Low panic', 'Conviction-based'],
    weakness: 'Holds bags too long sometimes',
    strength: 'Massive gains on core positions',
  },
  'revenge-trader': {
    id: 'revenge-trader',
    label: 'The Revenge Trader',
    emoji: '⚡',
    tagline: 'One loss triggers the storm.',
    gradient: 'from-rose-900 via-red-800 to-pink-900',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-500',
    traits: ['Loss-reactive', 'Overtrader', 'Emotional escalator'],
    weakness: 'Compounds losses with revenge trades',
    strength: 'High conviction after wins',
  },
  'contrarian': {
    id: 'contrarian',
    label: 'The Contrarian',
    emoji: '🔄',
    tagline: 'Zag when everyone zigs.',
    gradient: 'from-cyan-900 via-teal-800 to-cyan-900',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-500',
    traits: ['Dip buyer', 'Crowd-fader', 'Independent thinker'],
    weakness: 'Catches falling knives',
    strength: 'Buys at optimal entry points',
  },
};

function deterministicRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 100) / 100;
}

export function generateDemoAnalysis(walletAddress: string): BehavioralAnalysis {
  const r = (i: number) => Math.round(deterministicRandom(walletAddress, i) * 100);

  const fomoScore = Math.max(20, Math.min(95, r(1)));
  const panicSellScore = Math.max(15, Math.min(90, r(2)));
  const revengeTradeScore = Math.max(10, Math.min(85, r(3)));
  const diamondHandScore = Math.max(10, Math.min(95, 100 - fomoScore + r(4) * 0.3));
  const narrativeChaserScore = Math.max(20, Math.min(95, r(5)));
  const overallRiskScore = Math.round((fomoScore + panicSellScore + revengeTradeScore) / 3);

  const totalSwaps = 8 + Math.round(deterministicRandom(walletAddress, 6) * 40);
  const totalVolumeUsd = 500 + Math.round(deterministicRandom(walletAddress, 7) * 50000);
  const avgHoldTimeDays = 0.5 + deterministicRandom(walletAddress, 8) * 14;

  let personalityType: PersonalityType;
  if (revengeTradeScore > 70) {
    personalityType = 'revenge-trader';
  } else if (fomoScore > 70 && panicSellScore > 60) {
    personalityType = 'emotional-degen';
  } else if (narrativeChaserScore > 70 && fomoScore > 55) {
    personalityType = 'narrative-chaser';
  } else if (diamondHandScore > 70 && panicSellScore < 35) {
    personalityType = 'diamond-phantom';
  } else if (fomoScore < 30 && panicSellScore < 30) {
    personalityType = 'contrarian';
  } else {
    personalityType = 'calculated-sniper';
  }

  const allPatterns: BehavioralPattern[] = [
    {
      id: 'fomo-buy',
      name: 'FOMO Buying',
      emoji: '🚀',
      frequency: fomoScore,
      impact: fomoScore > 65 ? 'high' : fomoScore > 40 ? 'medium' : 'low',
      description: `${fomoScore}% of your buys happened after a 20%+ price spike`,
    },
    {
      id: 'panic-sell',
      name: 'Panic Selling',
      emoji: '📉',
      frequency: panicSellScore,
      impact: panicSellScore > 65 ? 'high' : panicSellScore > 40 ? 'medium' : 'low',
      description: `${panicSellScore}% of your sells happened during a rapid drawdown`,
    },
    {
      id: 'revenge-trade',
      name: 'Revenge Trading',
      emoji: '⚡',
      frequency: revengeTradeScore,
      impact: revengeTradeScore > 50 ? 'high' : 'medium',
      description: `You made impulsive trades within 1 hour of a major loss ${revengeTradeScore}% of the time`,
    },
    {
      id: 'narrative-chase',
      name: 'Narrative Chasing',
      emoji: '📡',
      frequency: narrativeChaserScore,
      impact: narrativeChaserScore > 65 ? 'high' : 'medium',
      description: `${narrativeChaserScore}% of your trades followed a viral Twitter narrative within 4 hours`,
    },
    {
      id: 'diamond-hands',
      name: 'Diamond Hands',
      emoji: '💎',
      frequency: diamondHandScore,
      impact: 'low',
      description: `You held positions through volatility ${diamondHandScore}% of the time`,
    },
  ];

  const topPatterns = allPatterns
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3);

  return {
    fomoScore,
    panicSellScore,
    revengeTradeScore,
    diamondHandScore,
    narrativeChaserScore,
    overallRiskScore,
    personalityType,
    totalSwaps,
    totalVolumeUsd,
    avgHoldTimeDays: parseFloat(avgHoldTimeDays.toFixed(1)),
    topPatterns,
    walletAddress,
    analyzedAt: Date.now(),
  };
}
