'use client';

import { NarrativeItem } from '@/lib/narratives';

function MomentumBadge({ m }: { m: NarrativeItem['momentum'] }) {
  const map = { rising: { l: '↑ Rising', c: 'badge-rising' }, peak: { l: '⚡ Peak', c: 'badge-peak' }, fading: { l: '↓ Fading', c: 'badge-fading' } };
  return <span className={`${map[m].c}`} style={{ fontSize: 11, fontWeight: 700 }}>{map[m].l}</span>;
}

export function NarrativeFeed({ narratives, userNarrativeChaserScore }: { narratives: NarrativeItem[]; userNarrativeChaserScore?: number }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 16 }}>🌐 Narrative Intelligence</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live</span>
        </div>
      </div>

      {userNarrativeChaserScore && userNarrativeChaserScore > 65 && (
        <div className="warning-box" style={{ marginBottom: 14 }}>
          ⚠️ Your Narrative Chaser score is <strong>{userNarrativeChaserScore}/100</strong>. By the time a narrative trends, early movers are already up 40–200%.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {narratives.map(n => {
          const volColor = n.volumeChange24h >= 0 ? '#10b981' : '#ef4444';
          const winColor = n.historicalWinRate > 55 ? '#10b981' : n.historicalWinRate > 40 ? '#f59e0b' : '#ef4444';
          return (
            <div key={n.id} className="glass" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{n.emoji}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-space)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{n.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MomentumBadge m={n.momentum} />
                      <span className={`risk-${n.riskLevel}`} style={{ fontSize: 11, fontWeight: 600 }}>
                        {n.riskLevel === 'high' ? '🔴' : n.riskLevel === 'medium' ? '🟡' : '🟢'} {n.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-space)', fontWeight: 800, fontSize: 18, color: volColor }}>
                    {n.volumeChange24h >= 0 ? '+' : ''}{n.volumeChange24h}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>vol 24h</div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{n.description}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {n.topTokens.map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, fontFamily: 'monospace', background: 'rgba(124,58,237,0.14)', color: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.22)' }}>
                      ${t}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Win rate: <span style={{ color: winColor, fontWeight: 700 }}>{n.historicalWinRate}%</span>
                </div>
              </div>

              {n.warning && <div className="warning-box" style={{ marginTop: 10, fontSize: 12 }}>{n.warning}</div>}

              {/* Social bar */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-bar-fill" style={{
                    width: `${Math.min(100, (n.socialMentions24h / 100000) * 100)}%`,
                    background: n.momentum === 'rising' ? 'linear-gradient(90deg,#10b98155,#10b981)' : n.momentum === 'peak' ? 'linear-gradient(90deg,#f59e0b55,#f59e0b)' : 'linear-gradient(90deg,#ef444455,#ef4444)'
                  }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {(n.socialMentions24h / 1000).toFixed(1)}K mentions
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
