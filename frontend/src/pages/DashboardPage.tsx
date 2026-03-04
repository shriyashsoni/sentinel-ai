import { useMemo, useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { formatEther } from 'viem'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { guardianContract, chainlinkPriceFeed } from '../lib/guardian'
import { getHealth, getRuns, runPipeline, type WalletSignals } from '../lib/api'
import { 
  Activity, Zap, Settings, RefreshCw, 
  Database, Terminal, 
  Scan, Lock, Globe, Shield, Radio, Cpu, BarChart3, Link as LinkIcon, CheckCircle, Clock, AlertTriangle
} from 'lucide-react'

// Transaction type for tracking
type Transaction = {
  id: string
  hash: string
  action: string
  status: 'pending' | 'success' | 'failed'
  timestamp: number
  target?: string
}

const initialSignals: WalletSignals = {
  wallet: '0x1111111111111111111111111111111111111111',
  approvalAmountPercent: 95,
  contractReputationScore: 18,
  transactionVelocity: 12,
  velocityThreshold: 10,
  newContractInteraction: true,
  blacklistMatch: true,
}

const MOCK_Protect_Modules = [
  { id: 1, name: 'Phishing Detector', active: true, desc: 'Real-time domain verification and blacklisting.', icon: Globe },
  { id: 2, name: 'Rug Pull Monitor', active: true, desc: 'LP lock verification and contract ownership scans.', icon: Activity },
  { id: 3, name: 'Gas Spike Guard', active: false, desc: 'Automatic transaction pausing during volatility.', icon: BarChart3 },
  { id: 4, name: 'Honeypot Scanner', active: true, desc: 'Simulation-based exit liquidity checks.', icon: Scan },
]

function RiskGauge({ score }: { score: number }) {
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const color = score > 70 ? 'var(--danger)' : score > 40 ? 'var(--warning)' : 'var(--secondary)'

  return (
    <div className="risk-gauge">
      <svg width="160" height="160" className="gauge-svg">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="14" fill="none" />
        <motion.circle 
          cx="80" cy="80" r={radius} 
          stroke="url(#gaugeGradient)" 
          strokeWidth="14" 
          strokeLinecap="round"
          fill="none" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, type: "spring", bounce: 0 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text x="50%" y="45%" textAnchor="middle" dy="0.3em" fill="#fff" fontSize="32" fontWeight="800" fontFamily="var(--font-mono)">
          {score}%
        </text>
        <text x="50%" y="65%" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="700" letterSpacing="0.1em">
          THREAT LEVEL
        </text>
      </svg>
    </div>
  )
}

function LiveFeed() {
  const [logs, setLogs] = useState<{id: number, text: string, type: 'scan'|'alert'|'info'}[]>([])

  useEffect(() => {
    const messages = [
      { text: "Verifying contract 0x71...f3a", type: 'scan' },
      { text: "Liquidity lock verified on Uniswap V3", type: 'info' },
      { text: "Suspicious gas spike detected: 420 Gwei", type: 'alert' },
      { text: "Monitoring wallet velocity...", type: 'scan' },
      { text: "New approval request: USDC (Permit2)", type: 'info' },
    ]
    
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)]
      setLogs(prev => [{ id: Date.now(), ...msg } as any, ...prev].slice(0, 6))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="terminal-wrap">
      <div className="terminal-header">
        <div className="terminal-dot" style={{background:'#ff5f56'}}></div>
        <div className="terminal-dot" style={{background:'#ffbd2e'}}></div>
        <div className="terminal-dot" style={{background:'#27c93f'}}></div>
        <span style={{fontSize:'0.7rem', color:'var(--text-muted)', marginLeft:'0.5rem', fontWeight:600}}>SENTINEL_SURVEILLANCE_V1.0</span>
      </div>
      <div className="terminal-body">
        <AnimatePresence initial={false}>
          {logs.map(log => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="terminal-line"
              style={{ color: log.type === 'alert' ? 'var(--danger)' : log.type === 'scan' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <span style={{opacity:0.5}}>[{new Date(log.id).toLocaleTimeString([], {hour12:false})}]</span> {log.type === 'alert' ? '▲' : '>'} {log.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && <div style={{opacity:0.3}}>_ Initializing system...</div>}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { address } = useAccount()

  const [signals, setSignals] = useState<WalletSignals>({ ...initialSignals })
  const [threshold, setThreshold] = useState(70)
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState<string>('Unknown')
  const [pipelineResult, setPipelineResult] = useState<Record<string, unknown> | null>(null)
  const [runs, setRuns] = useState<Record<string, unknown>[]>([])
  
  // New state for modules
  const [modules, setModules] = useState(MOCK_Protect_Modules)

  // Transaction tracking
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()

  // Admin / Write Actions State
  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract()
  const [targetToken, setTargetToken] = useState('')
  const [flagAddr, setFlagAddr] = useState('')

  // Wait for transaction receipt
  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  // Track transaction hash changes
  useEffect(() => {
    if (txHash) {
      setLastTxHash(txHash)
    }
  }, [txHash])

  // Update transaction status when confirmed
  useEffect(() => {
    if (isTxSuccess && lastTxHash) {
      setTransactions(prev => 
        prev.map(tx => 
          tx.hash === lastTxHash ? { ...tx, status: 'success' } : tx
        )
      )
      // Refetch contract state after successful transaction
      void protectionQuery.refetch()
      void scoreQuery.refetch()
    }
  }, [isTxSuccess, lastTxHash])

  // Helper to add transaction to history
  const addTransaction = useCallback((action: string, hash: string, target?: string) => {
    const newTx: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      hash,
      action,
      status: 'pending',
      timestamp: Date.now(),
      target,
    }
    setTransactions(prev => [newTx, ...prev].slice(0, 10)) // Keep last 10
  }, [])

  // Derived state
  const walletForRead = useMemo(() => (address || signals.wallet), [address, signals.wallet])

  const balanceQuery = useBalance({ address })

  const protectionQuery = useReadContract({
    abi: guardianContract.abi,
    address: guardianContract.address as `0x${string}`,
    functionName: 'protectionActive',
    chainId: guardianContract.chainId,
  })

  const scoreQuery = useReadContract({
    abi: guardianContract.abi,
    address: guardianContract.address as `0x${string}`,
    functionName: 'riskScores',
    args: [walletForRead as `0x${string}`],
    chainId: guardianContract.chainId
  })

  // Chainlink ETH/USD Price Feed Query
  const priceQuery = useReadContract({
    abi: chainlinkPriceFeed.abi,
    address: chainlinkPriceFeed.address as `0x${string}`,
    functionName: 'latestRoundData',
    chainId: chainlinkPriceFeed.chainId,
  })

  // Format ETH price from Chainlink (8 decimals)
  const ethPrice = useMemo(() => {
    if (priceQuery.data) {
      const [, answer] = priceQuery.data as [bigint, bigint, bigint, bigint, bigint]
      return (Number(answer) / 1e8).toFixed(2)
    }
    return '---'
  }, [priceQuery.data])

  // Use the connected address as default target if empty
  const activeTarget = address || '0x0000000000000000000000000000000000000000'

  const handleFlagContract = (e: FormEvent) => {
    e.preventDefault()
    if (!flagAddr) return
    writeContract({
        abi: guardianContract.abi,
        address: guardianContract.address as `0x${string}`,
        functionName: 'flagContract',
        args: [flagAddr as `0x${string}`],
        chainId: guardianContract.chainId
    }, {
      onSuccess: (hash) => addTransaction('Flag Contract', hash, flagAddr),
      onError: (err) => console.error('Flag contract failed:', err)
    })
  }

  const handleSoS = () => {
    if (!address) return
    writeContract({
        abi: guardianContract.abi,
        address: guardianContract.address as `0x${string}`,
        functionName: 'emergencyLock',
        args: [address],
        chainId: guardianContract.chainId
    }, {
      onSuccess: (hash) => addTransaction('Emergency Lock', hash, address),
      onError: (err) => console.error('Emergency lock failed:', err)
    })
  }

  const handleRevoke = (e: FormEvent) => {
    e.preventDefault()
    if (!targetToken) return
    writeContract({
        abi: guardianContract.abi,
        address: guardianContract.address as `0x${string}`,
        functionName: 'revokeHighRiskApproval',
        args: [activeTarget as `0x${string}`, targetToken as `0x${string}`],
        chainId: guardianContract.chainId
    }, {
      onSuccess: (hash) => addTransaction('Revoke Approval', hash, targetToken),
      onError: (err) => console.error('Revoke approval failed:', err)
    })
  }

  const latestScore = scoreQuery.data ? Number(scoreQuery.data) : 0
  const protectionActive = !!protectionQuery.data

  // Effects
  useEffect(() => {
    handleHealthCheck()
  }, [])

  async function handleRunPipeline(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await runPipeline(signals, threshold)
      setPipelineResult(response)
      const history = await getRuns(10)
      setRuns(history)
      void protectionQuery.refetch()
      void scoreQuery.refetch()
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Pipeline call failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshRuns() {
    const history = await getRuns(10)
    setRuns(history)
  }

  async function handleHealthCheck() {
    try {
      const response = await getHealth()
      setHealth(response.status === 'ok' ? 'Healthy' : 'Unhealthy')
    } catch {
      setHealth('Offline')
    }
  }

  function applyPreset(type: 'safe' | 'medium' | 'danger') {
    if (type === 'safe') {
      setSignals((prev) => ({
        ...prev,
        approvalAmountPercent: 15,
        contractReputationScore: 88,
        transactionVelocity: 2,
        velocityThreshold: 10,
        newContractInteraction: false,
        blacklistMatch: false,
      }))
      setThreshold(70)
      return
    }

    if (type === 'medium') {
      setSignals((prev) => ({
        ...prev,
        approvalAmountPercent: 62,
        contractReputationScore: 42,
        transactionVelocity: 8,
        velocityThreshold: 10,
        newContractInteraction: true,
        blacklistMatch: false,
      }))
      setThreshold(65)
      return
    }

    setSignals({ ...initialSignals })
    setThreshold(70)
  }

  function toggleModule(id: number) {
    setModules(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m))
  }

  const balance = balanceQuery.data ? Number(formatEther(balanceQuery.data.value)).toFixed(4) : '0.0000'

  return (
    <div className="container page dashboard-layout">
      
      {/* Top Status Bar */}
      <div className="status-bar-grid">
         <motion.div 
           className="stat-card"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
         >
            <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><Shield size={18} color={protectionActive ? "var(--secondary)" : "var(--text-muted)"} /></div>
            <div>
              <div className="stat-label">Protection</div>
              <div className="stat-value" style={{color: protectionActive ? 'var(--secondary)' : 'var(--text-muted)'}}>
                {protectionActive ? 'ENABLED' : 'INACTIVE'}
              </div>
            </div>
         </motion.div>

         <motion.div 
           className="stat-card"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.15 }}
         >
            <div className="stat-icon-wrap" style={{ background: 'rgba(55, 91, 210, 0.1)' }}><LinkIcon size={18} color="#375bd2" /></div>
            <div>
              <div className="stat-label">ETH/USD</div>
              <div className="stat-value" style={{color: '#8ca6ff'}}>
                ${ethPrice}
              </div>
            </div>
         </motion.div>

         <motion.div 
           className="stat-card"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
         >
            <div className="stat-icon-wrap" style={{ background: health === 'Healthy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}><Cpu size={18} color={health === 'Healthy' ? "var(--secondary)" : "var(--danger)"} /></div>
            <div>
              <div className="stat-label">Node Status</div>
              <div className="stat-value">{health}</div>
            </div>
         </motion.div>

         <motion.div 
           className="stat-card"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.25 }}
         >
            <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><Activity size={18} color="var(--warning)" /></div>
            <div>
              <div className="stat-label">Wallet</div>
              <div className="stat-value">{balance} ETH</div>
            </div>
         </motion.div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Configuration */}
        <motion.div className="panel config-panel" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="panel-header">
            <div className="panel-title"><Settings size={18} /> Risk Simulation</div>
          </div>
          
          <div className="preset-selector">
             <button className="preset-btn safe" onClick={() => applyPreset('safe')}>Safe</button>
             <button className="preset-btn medium" onClick={() => applyPreset('medium')}>Degen</button>
             <button className="preset-btn danger" onClick={() => applyPreset('danger')}>Attack</button>
          </div>

          <form onSubmit={handleRunPipeline} className="risk-form">
            <div className="form-group">
                <label>Target Wallet</label>
                <input 
                  type="text" 
                  value={signals.wallet}
                  onChange={(e) => setSignals(p => ({...p, wallet: e.target.value}))}
                  className="input-code"
                />
            </div>
            
            <div className="grid-2">
                <div className="form-group">
                  <label>Approvals %</label>
                  <input type="number" value={signals.approvalAmountPercent} onChange={(e) => setSignals(p => ({...p, approvalAmountPercent: Number(e.target.value)}))} />
                </div>
                <div className="form-group">
                  <label>Reputation</label>
                  <input type="number" value={signals.contractReputationScore} onChange={(e) => setSignals(p => ({...p, contractReputationScore: Number(e.target.value)}))} />
                </div>
            </div>

            <div className="switch-group">
               <label className="switch-row">
                  <span>New Contract Interaction</span>
                  <input 
                    type="checkbox" 
                    checked={signals.newContractInteraction} 
                    onChange={e => setSignals(p => ({...p, newContractInteraction: e.target.checked}))}
                  />
               </label>
               <label className="switch-row">
                  <span>Blacklist Match</span>
                  <input 
                    type="checkbox" 
                    checked={signals.blacklistMatch} 
                    onChange={e => setSignals(p => ({...p, blacklistMatch: e.target.checked}))}
                  />
               </label>
            </div>

            <div className="divider"></div>
            
            <div className="form-group">
               <label>Security Threshold: {threshold}</label>
               <input 
                  type="range" 
                  min="0" max="100" 
                  value={threshold} 
                  onChange={(e) => setThreshold(Number(e.target.value))} 
                  className="slider"
               />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <RefreshCw className="spin" size={18} /> : <Zap size={18} />}
              RUN DIAGNOSTIC
            </button>
          </form>
        </motion.div>

        {/* Center Column: Visualization & Terminal */}
        <div className="center-col">
          <motion.div className="panel visual-panel" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
             <div className="panel-header">
                <div className="panel-title"><BarChart3 size={20} /> Asset Safety Index</div>
                <div className="chainlink-badge">
                  <LinkIcon size={12} /> Powered by Chainlink
                </div>
             </div>

             <div className="gauge-container" style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem 0', position:'relative'}}>
               <RiskGauge score={latestScore > 0 ? latestScore : (pipelineResult?.riskScore as number || 0)} />
               {pipelineResult && (
                 <motion.div 
                   className={`decision-badge ${(pipelineResult.riskScore as number) < 50 ? 'SAFE' : 'BLOCK'}`}
                   initial={{ scale: 0, x: 20 }}
                   animate={{ scale: 1, x: 0 }}
                   style={{position:'absolute', top:'1rem', right:'1rem'}}
                 >
                   {(pipelineResult.riskScore as number) < 50 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                   {(pipelineResult.riskScore as number) < 50 ? 'SECURE' : 'THREAT'}
                 </motion.div>
               )}
             </div>

             <div className="divider" style={{margin:'1.5rem 0'}}></div>
             <LiveFeed />
          </motion.div>

          <div className="modules-grid" style={{marginTop:'1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
             {modules.map(mod => (
               <motion.div 
                 key={mod.id} 
                 className={`module-card ${mod.active ? 'active' : ''}`}
                 whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                 onClick={() => toggleModule(mod.id)}
                 style={{
                   cursor:'pointer',
                   padding: '1.25rem',
                   borderRadius: 'var(--radius-md)',
                   background: 'var(--bg-card)',
                   border: 'var(--glass-border)',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '0.75rem'
                 }}
               >
                 <div className="module-top" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <mod.icon size={22} color={mod.active ? "var(--secondary)" : "var(--text-muted)"} />
                    <div className={`chip ${mod.active ? 'active' : ''}`} style={{fontSize:'0.65rem', fontWeight:700}}>
                      {mod.active ? 'LIVE' : 'IDLE'}
                    </div>
                 </div>
                 <div>
                    <div className="module-name" style={{fontSize:'0.9rem', fontWeight:700}}>{mod.name}</div>
                    <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.4rem', lineHeight:1.4}}>{(mod as any).desc}</div>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>

        {/* Right Column: Active Protection & Transactions */}
        <div className="right-col">
          <motion.div className="panel admin-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="panel-header">
              <div className="panel-title"><Shield size={18} /> Guardian Guard</div>
            </div>

            <button 
              className={`btn-sos ${protectionActive ? 'active' : ''}`}
              onClick={handleSoS}
              disabled={isWritePending}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: protectionActive ? 'var(--danger)' : 'rgba(239, 68, 68, 0.1)',
                color: protectionActive ? '#fff' : 'var(--danger)',
                border: `1px solid ${protectionActive ? 'transparent' : 'var(--danger)'}`,
                boxShadow: protectionActive ? '0 0 25px rgba(239, 68, 68, 0.4)' : 'none'
              }}
            >
              {isWritePending ? <RefreshCw className="spin" size={20} /> : <Lock size={20} />}
              <span>{protectionActive ? 'SYSTEM LOCKED' : 'EMERGENCY LOCK'}</span>
            </button>

            <div className="divider" style={{margin:'1.5rem 0'}}></div>

            <div className="admin-controls" style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
               <div className="control-group">
                  <label style={{fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', marginBottom:'0.5rem', display:'block', textTransform:'uppercase'}}>Flag Suspicious Contract</label>
                  <form onSubmit={handleFlagContract} className="flex-row" style={{display:'flex', gap:'0.5rem'}}>
                    <input 
                      className="input-sm" 
                      placeholder="0x..." 
                      value={flagAddr}
                      onChange={e => setFlagAddr(e.target.value)}
                      style={{flex:1, background:'rgba(0,0,0,0.2)', border:'var(--glass-border)', padding:'0.6rem', borderRadius:'6px', color:'#fff', fontSize:'0.85rem'}}
                    />
                    <button type="submit" className="btn-icon" style={{background:'var(--primary)', border:'none', color:'#fff', padding:'0.6rem', borderRadius:'6px', cursor:'pointer'}}><Radio size={16}/></button>
                  </form>
               </div>

               <div className="control-group">
                  <label style={{fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', marginBottom:'0.5rem', display:'block', textTransform:'uppercase'}}>Revoke Specific Approval</label>
                  <form onSubmit={handleRevoke} className="flex-row" style={{display:'flex', gap:'0.5rem'}}>
                    <input 
                      className="input-sm" 
                      placeholder="Token Address" 
                      value={targetToken}
                      onChange={e => setTargetToken(e.target.value)}
                      style={{flex:1, background:'rgba(0,0,0,0.2)', border:'var(--glass-border)', padding:'0.6rem', borderRadius:'6px', color:'#fff', fontSize:'0.85rem'}}
                    />
                    <button type="submit" className="btn-icon" style={{background:'var(--primary)', border:'none', color:'#fff', padding:'0.6rem', borderRadius:'6px', cursor:'pointer'}}><Lock size={16}/></button>
                  </form>
               </div>
            </div>
          </motion.div>

          <motion.div className="panel tx-panel" style={{marginTop:'1.5rem'}} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-header compact">
              <div className="panel-title" style={{fontSize:'0.9rem', fontWeight:700}}><Clock size={18} /> Live Activity</div>
              {isWritePending && <span className="chainlink-badge" style={{fontSize:'0.65rem'}}>SYCING...</span>}
            </div>
            
            <div className="tx-list" style={{display:'flex', flexDirection:'column', gap:'0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px'}}>
              {transactions.length > 0 ? (
                transactions.map(tx => (
                  <div key={tx.id} className={`tx-item ${tx.status}`} style={{
                    padding: '0.8rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${tx.status === 'success' ? 'rgba(16,185,129,0.2)' : tx.status === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem'
                  }}>
                    <div className="tx-status-icon" style={{
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: tx.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                      color: tx.status === 'success' ? 'var(--secondary)' : 'var(--text-muted)'
                    }}>
                      {tx.status === 'pending' ? <RefreshCw className="spin-slow" size={16} /> : 
                       tx.status === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="tx-details" style={{flex:1}}>
                      <div className="tx-action" style={{fontSize:'0.85rem', fontWeight:700, color:'#fff'}}>{tx.action}</div>
                      <div className="tx-hash" style={{fontSize:'0.7rem'}}>
                        <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="etherscan-link" style={{color:'var(--primary)', textDecoration:'none', opacity:0.8}}>
                          {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                        </a>
                      </div>
                    </div>
                    <div className="tx-time" style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>
                      {new Date(tx.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))
              ) : (
                <div className="tx-empty" style={{textAlign:'center', padding:'2rem 0', color:'var(--text-muted)', fontSize:'0.8rem'}}>
                  <Terminal size={32} style={{opacity:0.2, marginBottom:'0.5rem'}} />
                  <div>System Idle</div>
                  <small>Awaiting on-chain activity</small>
                </div>
              )}
            </div>
            
            <div className="divider" style={{margin:'1rem 0'}}></div>
            <div className="tx-footer" style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.75rem'}}>
               <div className="contract-badge" style={{color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px', fontFamily:'var(--font-mono)'}}>
                  <Shield size={12} /> {guardianContract.address.slice(0,8)}...
               </div>
               <a href={`https://sepolia.etherscan.io/address/${guardianContract.address}`} target="_blank" rel="noopener noreferrer" className="view-contract-link" style={{color:'var(--primary)', textDecoration:'none', fontWeight:700}}>
                  EXPLORE
               </a>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Activity Log Table (Bottom) */}
      <motion.div className="panel history-panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
         <div className="panel-header">
            <div className="panel-title"><Database size={18} /> Execution History</div>
            <button className="btn btn-ghost" onClick={handleRefreshRuns}><RefreshCw size={14} /></button>
         </div>
         <div className="table-responsive">
           <table className="history-table">
             <thead>
               <tr>
                 <th>Timestamp</th>
                 <th>Score</th>
                 <th>Action</th>
                 <th>Wallet</th>
                 <th>Status</th>
               </tr>
             </thead>
             <tbody>
               {runs.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="empty-cell">No execution logs found</td>
                 </tr>
               ) : (
                 runs.map((run, i) => (
                   <tr key={i}>
                     <td>{new Date(run.timestamp as string || Date.now()).toLocaleTimeString()}</td>
                     <td><span className={`score-pill ${(run.riskScore as number) > 70 ? 'high' : 'low'}`}>{run.riskScore as number}</span></td>
                     <td>{(run.decision as any)?.action}</td>
                     <td className="mono">{String((run.inputs as any)?.wallet || '').slice(0,6)}...</td>
                     <td><span className="status-badge success">Verified</span></td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
      </motion.div>

    </div>
  )
}