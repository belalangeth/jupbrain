'use client';
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';

export function PixelTrade({fomoScore,initialOutputMint='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'}:{fomoScore:number;initialOutputMint?:string}){
  const { publicKey, signTransaction } = useWallet();
  const [amountIn, setAmountIn] = useState('0.1');
  const [outputMint, setOutputMint] = useState(initialOutputMint);
  const [quote, setQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [txId, setTxId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-update output token when passed from Market tab
  useEffect(() => {
    setOutputMint(initialOutputMint);
  }, [initialOutputMint]);

  // Fetch Quote (Order)
  const fetchQuote = useCallback(async () => {
    if (!amountIn || isNaN(Number(amountIn)) || Number(amountIn) <= 0) return;
    setLoadingQuote(true);
    setErrorMsg('');
    setQuote(null);
    try {
      const lamports = Math.floor(Number(amountIn) * 1e9).toString();
      const params = new URLSearchParams({
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: outputMint,
        amount: lamports,
      });
      // Optionally attach taker if wallet connected for better routing checks
      if (publicKey) params.append('taker', publicKey.toBase58());

      const res = await fetch(`https://api.jup.ag/swap/v2/order?${params}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Order failed: ${txt}`);
      }
      const data = await res.json();
      setQuote(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to fetch route");
    } finally {
      setLoadingQuote(false);
    }
  }, [amountIn, outputMint, publicKey]);

  // Debounce fetching quotes
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 600);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // Execute Swap
  const handleSwap = async () => {
    if (!publicKey || !signTransaction) {
      setErrorMsg("Please connect your wallet first.");
      return;
    }
    if (!quote || !quote.transaction) {
      setErrorMsg("No valid quote found.");
      return;
    }
    setSwapping(true);
    setErrorMsg('');
    setTxId('');
    try {
      // 1. Decode transaction from base64
      const txBytes = Buffer.from(quote.transaction, "base64");
      const transaction = VersionedTransaction.deserialize(txBytes);

      // 2. Sign transaction with wallet
      const signedTx = await signTransaction(transaction);
      const signedTxBase64 = Buffer.from(signedTx.serialize()).toString("base64");

      // 3. Execute via Jupiter V2 execute endpoint
      const res = await fetch(`https://api.jup.ag/swap/v2/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction: signedTxBase64,
          requestId: quote.requestId,
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Execute failed: ${txt}`);
      }

      const result = await res.json();
      if (result.status === "Success" || result.signature) {
        setTxId(result.signature);
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Swap execution failed");
    } finally {
      setSwapping(false);
    }
  };

  return(
    <div className="container" style={{paddingTop:16}}>
      <div className="sec-hdr">
        <div className="sec-title"><span className="pixel-sq pixel-sq-lime"/><span className="pixel-sq pixel-sq-cyan" style={{marginLeft:3}}/>&nbsp;SWAP — JUPITER SWAP V2</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span className="badge badge-green">NATIVE API</span>
          <span className="badge badge-cyan">GASLESS</span>
          <span className="badge badge-lime">MEV PROTECTED</span>
        </div>
      </div>

      {fomoScore>65&&(
        <div className="warn" style={{marginBottom:12}}>
          ⚠ FOMO SCORE: {fomoScore}/100 — HIGH EMOTIONAL RISK. CONSIDER LIMIT ORDER INSTEAD.
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <div className="card card-p">
          <div style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--muted)',marginBottom:8}}>NATIVE V2 ROUTING ENGINE</div>
          {[
            ['GET /swap/v2/order','Fetching best price from ALL routers'],
            ['Routers competing','Metis, JupiterZ RFQ, Dflow, OKX'],
            ['POST /swap/v2/execute','Managed landing + MEV protection'],
          ].map(([k,v])=>(
            <div key={k} className="quote-row">
              <span className="quote-key" style={{fontFamily:'var(--font-mono)',fontSize:12}} dangerouslySetInnerHTML={{__html:k}}/>
              <span className="quote-val" style={{fontSize:12,textAlign:'right',maxWidth:160}} dangerouslySetInnerHTML={{__html:v}}/>
            </div>
          ))}
        </div>
        <div className="card card-p">
          <div style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--muted)',marginBottom:8}}>TOKEN MINT (OUTPUT)</div>
          <input 
            type="text" 
            className="search-input" 
            value={outputMint} 
            onChange={(e)=>setOutputMint(e.target.value)}
            placeholder="Paste Token Mint Address..."
            style={{width:'100%',fontSize:12}}
          />
          <div style={{fontSize:11,color:'var(--muted)',marginTop:8}}>*Select from MARKET tab to auto-fill.</div>
        </div>
      </div>

      <div className="card" style={{padding:24, maxWidth:500, margin:'0 auto'}}>
        <div style={{fontFamily:'var(--font-pixel)',fontSize:18,color:'var(--lime)',marginBottom:16}}>EXECUTE TRADE</div>
        
        <div style={{marginBottom:12}}>
          <label style={{display:'block',color:'var(--muted)',fontSize:12,marginBottom:4}}>PAYING (SOL)</label>
          <input 
            type="number" 
            className="search-input" 
            value={amountIn} 
            onChange={(e)=>setAmountIn(e.target.value)}
            style={{width:'100%',fontSize:24,padding:'12px 16px',background:'var(--navy-d)'}}
          />
        </div>

        <div style={{textAlign:'center',padding:'8px 0',color:'var(--muted)'}}>↓</div>

        <div style={{marginBottom:20}}>
          <label style={{display:'block',color:'var(--muted)',fontSize:12,marginBottom:4}}>RECEIVING (ESTIMATED)</label>
          <div style={{width:'100%',fontSize:24,padding:'12px 16px',background:'var(--navy-d)',border:'1px solid var(--border)',color:loadingQuote?'var(--muted)':'var(--fg)',minHeight:56,display:'flex',alignItems:'center'}}>
            {loadingQuote ? 'Fetching route...' : (quote ? (Number(quote.outAmount) / 10**6).toLocaleString() : '0.00')}
          </div>
          {quote && !loadingQuote && (
            <div style={{fontSize:11,color:'var(--lime)',marginTop:8,fontFamily:'var(--font-mono)'}}>
              ROUTER: {quote.router?.toUpperCase() || 'METIS'} | MODE: {quote.mode?.toUpperCase()}
            </div>
          )}
          {errorMsg && (
            <div style={{fontSize:12,color:'#ff4444',marginTop:8,background:'rgba(255,0,0,0.1)',padding:'6px 10px',borderLeft:'3px solid #ff4444'}}>
              {errorMsg}
            </div>
          )}
        </div>

        <button 
          className="btn btn-lime btn-full" 
          style={{padding:'16px',fontSize:18,justifyContent:'center'}}
          onClick={handleSwap}
          disabled={!publicKey || loadingQuote || !quote || swapping}
        >
          {swapping ? 'EXECUTING SWAP...' : (publicKey ? 'SWAP NOW' : 'CONNECT WALLET TO SWAP')}
        </button>

        {txId && (
          <div style={{marginTop:16,padding:12,background:'rgba(204,255,0,0.1)',border:'1px solid rgba(204,255,0,0.3)',textAlign:'center'}}>
            <div style={{color:'var(--lime)',fontFamily:'var(--font-pixel)',marginBottom:4}}>SWAP SUCCESSFUL!</div>
            <a href={`https://solscan.io/tx/${txId}`} target="_blank" rel="noopener noreferrer" style={{color:'var(--fg)',fontSize:12,textDecoration:'underline'}}>View on Solscan ↗</a>
          </div>
        )}
      </div>
    </div>
  );
}
