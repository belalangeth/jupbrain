export interface NarrativeItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  momentum: 'rising' | 'peak' | 'fading';
  riskLevel: 'high' | 'medium' | 'low';
  topTokens: string[];
  volumeChange24h: number;
  socialMentions24h: number;
  historicalWinRate: number;
  warning?: string;
}

export const LIVE_NARRATIVES: NarrativeItem[] = [
  {
    id: 'ai-agents',
    name: 'AI Agents on Solana',
    emoji: '🤖',
    description: 'Autonomous AI agents building and trading on-chain are dominating dev mindshare.',
    momentum: 'rising',
    riskLevel: 'medium',
    topTokens: ['AI16Z', 'VIRTUAL', 'ARC'],
    volumeChange24h: 142,
    socialMentions24h: 28400,
    historicalWinRate: 61,
  },
  {
    id: 'depin',
    name: 'DePIN Expansion',
    emoji: '📡',
    description: 'Decentralized physical infrastructure networks surging with new device activations.',
    momentum: 'rising',
    riskLevel: 'low',
    topTokens: ['HNT', 'MOBILE', 'IOT'],
    volumeChange24h: 87,
    socialMentions24h: 14200,
    historicalWinRate: 54,
  },
  {
    id: 'memecoins',
    name: 'Memecoin Season',
    emoji: '🐸',
    description: 'Pump.fun launches spiking. New meme meta cycling every 48–72 hours.',
    momentum: 'peak',
    riskLevel: 'high',
    topTokens: ['BONK', 'WIF', 'POPCAT'],
    volumeChange24h: 310,
    socialMentions24h: 95000,
    historicalWinRate: 22,
    warning: '⚠️ Most traders lose money during memecoin season. Late entries rarely win.',
  },
  {
    id: 'rwa',
    name: 'Real World Assets',
    emoji: '🏦',
    description: 'Tokenized treasuries and real estate gaining serious institutional traction.',
    momentum: 'rising',
    riskLevel: 'low',
    topTokens: ['ONDO', 'BUIDL', 'USDY'],
    volumeChange24h: 45,
    socialMentions24h: 8700,
    historicalWinRate: 68,
  },
  {
    id: 'jupiter-ecosystem',
    name: 'Jupiter Ecosystem',
    emoji: '🪐',
    description: 'JUP DAO governance activity and new product launches driving ecosystem momentum.',
    momentum: 'rising',
    riskLevel: 'medium',
    topTokens: ['JUP', 'JUPSOL'],
    volumeChange24h: 67,
    socialMentions24h: 19300,
    historicalWinRate: 58,
  },
  {
    id: 'gaming',
    name: 'On-Chain Gaming',
    emoji: '🎮',
    description: 'Fully on-chain games attracting new wave of non-crypto users to Solana.',
    momentum: 'fading',
    riskLevel: 'high',
    topTokens: ['ATLAS', 'POLIS', 'NYAN'],
    volumeChange24h: -12,
    socialMentions24h: 3400,
    historicalWinRate: 31,
  },
];
