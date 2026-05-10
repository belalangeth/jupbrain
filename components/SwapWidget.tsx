'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Jupiter: {
      init: (config: Record<string, unknown>) => void;
      close: () => void;
    };
  }
}

interface SwapWidgetProps {
  fomoScore?: number;
}

export function SwapWidget({ fomoScore = 0 }: SwapWidgetProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v4.js';
    script.setAttribute('data-preload', '');
    script.async = true;
    script.onload = () => {
      if (window.Jupiter) {
        window.Jupiter.init({
          displayMode: 'integrated',
          integratedTargetId: 'jupiter-terminal-container',
          endpoint: 'https://api.mainnet-beta.solana.com',
          defaultExplorer: 'Solscan',
          formProps: {
            initialInputMint: 'So11111111111111111111111111111111111111112', // SOL
            initialOutputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          },
        });
        initialized.current = true;
      }
    };
    document.body.appendChild(script);

    return () => {
      if (window.Jupiter) {
        try { window.Jupiter.close(); } catch { /* ignore */ }
      }
    };
  }, []);

  return (
    <div>
      {fomoScore > 60 && (
        <div className="warning-box mb-4 text-sm">
          🧠 <strong>JupBrain Guardrail Active:</strong> Your FOMO score is {fomoScore}/100.
          Before swapping, ask yourself: Is this trade based on analysis, or excitement?
        </div>
      )}

      {/* Jupiter Terminal renders here */}
      <div
        id="jupiter-terminal-container"
        style={{
          width: '100%',
          minHeight: 420,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}
