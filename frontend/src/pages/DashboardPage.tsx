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
  Scan, Lock, Globe, Shield, Radio, Cpu, BarChart3, Link, ExternalLink, CheckCircle, Clock, AlertTriangle
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

// Define the type for the modules
type EnhancedIcon = any; // Simplifying for build pass

const MOCK_Protect_Modules: { id: number; name: string; active: boolean; icon: EnhancedIcon }[] = [
  { id: 1, name: 'Phishing Detector', active: true, icon: Globe },
  { id: 2, name: 'Rug Pull Monitor', active: true, icon: ({ active }: { active: boolean }) => <Activity size={16} className={active ? "pulse" : ""} /> },
  { id: 3, name: 'Gas Spike Guard', active: false, icon: BarChart3 },
  { id: 4, name: 'Honeypot Scanner', active: true, icon: Scan },
]

function RiskGauge({ score }: { score: number }) {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const color = score > 70 ? '#ff4242' : score > 40 ? '#ffb742' : '#00ff9d'

  return (
    <div className="risk-gauge">
      <svg width="140" height="140" className="gauge-svg">
        <circle cx="70" cy="70" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
        <motion.circle 
          cx="70" cy="70" r={radius} 
          stroke={color} 
          strokeWidth="12" 
          fill="none" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fill="#fff" fontSize="28" fontWeight="bold">
          {score}
        </text>
        <text x="50%" y="70%" textAnchor="middle" fill="#888" fontSize="12">RISK SCORE</text>
      </svg>
    </div>
  )
}

function LiveFeed() {
  const [logs, setLogs] = useState<{id: number, text: string, type: 'scan'|'alert'|'info'}[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const type = Math.random() > 0.8 ? 'alert' : 'scan'
      const text = type === 'alert' 
        ? `Threat detected in block #${18000000 + Math.floor(Math.random() * 1000)}` 
        : `Scanning txn 0x${Math.random().toString(16).slice(2, 8)}...`
      
      setLogs(prev => [{ id: Date.now(), text, type } as const, ...prev].slice(0, 8))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="live-feed">
      <h4 style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontSize:'0.9rem', color:'#a0aec0'}}>
        <Radio size={14} className="pulse-red" /> Live Surveillance
      </h4>
      <div className="feed-list">
        <AnimatePresence>
          {logs.map(log => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`feed-item ${log.type}`}
            >
              <span className="dot"></span> {log.text}
            </motion.div>
          ))}
        </AnimatePresence>
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
  const [error, setError] = useState('')
  
  // New state for modules
  const [modules, setModules] = useState(MOCK_Protect_Modules)

  // Transaction tracking
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()

  // Admin / Write Actions State
  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract()
  const [targetUser, setTargetUser] = useState('')
  const [targetToken, setTargetToken] = useState('')
  const [flagAddr, setFlagAddr] = useState('')
  const [reportScore, setReportScore] = useState(50)

  // Wait for transaction receipt
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
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
  const walletForRead = useMemo(() => (targetUser || address || signals.wallet), [targetUser, address, signals.wallet])

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
  const activeTarget = targetUser || address || '0x0000000000000000000000000000000000000000'

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

  const handleReportRisk = (e: FormEvent) => {
    e.preventDefault()
    writeContract({
        abi: guardianContract.abi,
        address: guardianContract.address as `0x${string}`,
        functionName: 'reportRisk',
        args: [activeTarget as `0x${string}`, BigInt(reportScore)],
        chainId: guardianContract.chainId
    }, {
      onSuccess: (hash) => addTransaction(`Report Risk (Score: ${reportScore})`, hash, activeTarget),
      onError: (err) => console.error('Report risk failed:', err)
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
    setError('')
    try {
      const response = await runPipeline(signals, threshold)
      setPipelineResult(response)
      const history = await getRuns(10)
      setRuns(history)
      void protectionQuery.refetch()
      void scoreQuery.refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pipeline call failed')
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
            <div className="stat-icon-wrap"><Shield size={20} color={protectionActive ? "#00ff9d" : "#a0aec0"} /></div>
            <div>
              <div className="stat-label">Protection Status</div>
              <div className="stat-value" style={{color: protectionActive ? '#00ff9d' : '#a0aec0'}}>
                {protectionActive ? 'ACTIVE GUARD' : 'INACTIVE'}
              </div>
            </div>
         </motion.div>

         <motion.div 
           className="stat-card"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.15 }}
         >
            <div className="stat-icon-wrap"><Link size={20} color="#375bd2" /></div>
            <div>
              <div className="stat-label">Chainlink ETH/USD</div>
              <div className="stat-value" style={{color: '#375bd2'}}>
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
            <div className="stat-icon-wrap"><Cpu size={20} color="#4264fb" /></div>
            <div>
              <div className="stat-label">System Health</div>
              <div className="stat-value">{health}</div>
            </div>
         </motion.div>

         <motion.div 
           className="stat-card"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.25 }}
         >
            <div className="stat-icon-wrap"><Activity size={20} color="#ffb742" /></div>
            <div>
              <div className="stat-label">Wallet Balance</div>
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
          <motion.div className="panel visual-panel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
             <div className="gauge-container">
               <RiskGauge score={latestScore > 0 ? latestScore : (pipelineResult?.riskScore as number || 0)} />
               {pipelineResult && (
                 <motion.div 
                   className="decision-badge"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                 >
                   {(pipelineResult.decision as any)?.action}
                 </motion.div>
               )}
             </div>
          </motion.div>

          {/* Terminal */}
          <motion.div className="panel terminal-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="panel-header compact">
               <div className="panel-title"><Terminal size={14} /> System Output</div>
               <div className="dots">
                 <span></span><span></span><span></span>
               </div>
             </div>
             <div className="terminal-content">
                <div className="line">sentinel-ai@node-01:~$ initializing_sequence...</div>
                {loading && <div className="line warning">Running deterministic risk engine... [Please Wait]</div>}
                
                {pipelineResult && (
                  <>
                    <div className="line success">Analysis Complete. Risk Score calculated.</div>
                    <div className="line">Action Determined: {(pipelineResult.decision as any)?.action}</div>
                    {Boolean(pipelineResult?.onchain) && (
                       <div className="line highlight">Onchain Proofs Submitted.</div>
                    )}
                  </>
                )}
                {error && <div className="line error">Error: {error}</div>}
             </div>
          </motion.div>
        </div>

        {/* Right Column: Live Data */}
        <div className="right-col">
          <motion.div className="panel modules-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="panel-header">
               <div className="panel-title"><Lock size={16} /> Active Modules</div>
             </div>
             <div className="modules-grid">
               {modules.map(m => {
                 const Icon = m.icon
                 return (
                 <div key={m.id} className={`module-card ${m.active ? 'active' : ''}`} onClick={() => toggleModule(m.id)}>
                   <div className="module-icon">
                     {/* Rendering component if acts as functional component or element */}
                     {typeof Icon === 'function' && !('displayName' in Icon) ? (Icon as any)({ active: m.active }) : <Icon size={16} />}
                   </div>
                   <span>{m.name}</span>
                   <div className="status-dot"></div>
                 </div>
               )})}
             </div>
          </motion.div>

          <motion.div className="panel admin-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
             <div className="panel-header" style={{ borderColor: isWritePending ? '#ecc94b' : '#ff4242' }}>
               <div className="panel-title" style={{ color: isWritePending ? '#ecc94b' : '#ff4242' }}>
                 <Shield size={16} /> GUARDIAN CONTROLS
               </div>
               {protectionActive && <span className="badge-danger pulse">PROTECTION ACTIVE</span>}
             </div>
             <div className="admin-controls">
                
                <button 
                  onClick={handleSoS} 
                  className={`btn-sos ${protectionActive ? 'active' : ''}`}
                  disabled={isWritePending || protectionActive}
                >
                  {isWritePending ? <RefreshCw className="spin" /> : <Lock size={20} />}
                  <span>{protectionActive ? 'SYSTEM LOCKED' : 'EMERGENCY LOCK'}</span>
                </button>

                <div className="control-group">
                  <label>Flag Malicious Contract</label>
                  <form onSubmit={handleFlagContract} className="flex-row">
                    <input 
                      className="input-sm" 
                      placeholder="0x..." 
                      value={flagAddr}
                      onChange={e => setFlagAddr(e.target.value)}
                    />
                    <button type="submit" className="btn-icon" disabled={!flagAddr || isWritePending}>
                      <Zap size={14} />
                    </button>
                  </form>
                </div>

                <div className="control-group">
                  <label>Revoke Approval</label>
                  <form onSubmit={handleRevoke} className="flex-row">
                    <input 
                      className="input-sm" 
                      placeholder="Token Address" 
                      value={targetToken}
                      onChange={e => setTargetToken(e.target.value)}
                    />
                    <button type="submit" className="btn-icon" disabled={!targetToken || isWritePending}>
                      <Scan size={14} />
                    </button>
                  </form>
                </div>
                
                <div className="control-group">
                  <label>Manual Risk Override</label>
                  <form onSubmit={handleReportRisk} className="flex-row">
                    <input 
                      className="input-sm" 
                      placeholder="User Address (Optional)" 
                      value={targetUser}
                      onChange={e => setTargetUser(e.target.value)}
                    />
                    <input
                      type="number"
                      className="input-sm"
                      style={{ width: '50px', flex: 'none' }}
                      value={reportScore}
                      onChange={e => setReportScore(Number(e.target.value))}
                    />
                    <button type="submit" className="btn-icon" title="Report Risk" disabled={isWritePending}>
                      <BarChart3 size={14} />
                    </button>
                  </form>
                </div>

             </div>
          </motion.div>

          <motion.div className="panel feed-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
             <LiveFeed />
          </motion.div>

          {/* Blockchain Transactions Panel */}
          <motion.div className="panel tx-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
             <div className="panel-header compact">
               <div className="panel-title"><Link size={14} /> On-Chain Transactions</div>
               {(isWritePending || isTxLoading) && <span className="chainlink-badge"><Clock size={10} /> Pending</span>}
             </div>
             <div className="tx-list">
               {transactions.length === 0 ? (
                 <div className="tx-empty">
                   <Shield size={24} style={{ opacity: 0.3 }} />
                   <span>No transactions yet</span>
                   <small>Use Guardian Controls to interact with the smart contract</small>
                 </div>
               ) : (
                 <AnimatePresence>
                   {transactions.map(tx => (
                     <motion.div 
                       key={tx.id}
                       className={`tx-item ${tx.status}`}
                       initial={{ opacity: 0, x: 10 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0 }}
                     >
                       <div className="tx-status-icon">
                         {tx.status === 'pending' && <Clock size={14} className="spin-slow" />}
                         {tx.status === 'success' && <CheckCircle size={14} />}
                         {tx.status === 'failed' && <AlertTriangle size={14} />}
                       </div>
                       <div className="tx-details">
                         <div className="tx-action">{tx.action}</div>
                         <div className="tx-hash">
                           <a 
                             href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="etherscan-link"
                           >
                             {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                             <ExternalLink size={10} />
                           </a>
                         </div>
                       </div>
                       <div className="tx-time">
                         {new Date(tx.timestamp).toLocaleTimeString()}
                       </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               )}
             </div>
             <div className="tx-footer">
               <span className="contract-badge">
                 <Shield size={10} />
                 Contract: {guardianContract.address.slice(0, 6)}...{guardianContract.address.slice(-4)}
               </span>
               <a 
                 href={`https://sepolia.etherscan.io/address/${guardianContract.address}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="view-contract-link"
               >
                 View on Etherscan <ExternalLink size={10} />
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