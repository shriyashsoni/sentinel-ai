import { Network, Cpu, Shield, Database, Link as LinkIcon, Lock, Code, Globe, Activity, Layers } from 'lucide-react'

export function WhitepaperPage() {
  return (
    <div className="container page dashboard-layout" style={{ display: 'block', maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header Section */}
      <div className="panel" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(66, 100, 251, 0.1) 0%, rgba(3, 3, 6, 0.8) 100%)', border: '1px solid rgba(66, 100, 251, 0.2)' }}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Shield size={48} color="#4264fb" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(66, 100, 251, 0.5))' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>SentinelAI <span className="gradient-text">Protocol Whitepaper</span></h1>
          <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Autonomous Web3 Risk Guardianship: Bridging Deterministic Off-Chain Risk Orchestration with On-Chain Interventional Execution.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
             <a href="https://sepolia.etherscan.io/address/0xD7840983B638cFcf9fC0CD32b358B02eb43E59Ef" target="_blank" rel="noreferrer" className="chip active" style={{ textDecoration: 'none' }}>
                <LinkIcon size={14} /> View Contract
             </a>
             <a href="https://sentinel-ai.vercel.app" target="_blank" rel="noreferrer" className="chip active" style={{ textDecoration: 'none' }}>
                <Globe size={14} /> Production URL
             </a>
          </div>
        </div>
      </div>

      {/* Abstract Section */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
           <div className="panel-title"><Network size={18} /> 01. System Abstract</div>
        </div>
        <div style={{ padding: '0.5rem' }}>
          <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            SentinelAI is an evolutionary leap in Web3 security architecture. It transitions from traditional <strong>Passive Monitoring</strong> to <strong>Autonomous Interventional Defense</strong>. 
            By utilizing a high-performance FastAPI risk orchestration engine and Chainlink Decentralized Oracle Networks (DONs), SentinelAI 
            monitors wallet heuristics and dynamically executes defensive smart contract actions seconds before an exploit can materialize.
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
         {/* Risk Engine Logic */}
         <div className="panel">
            <div className="panel-header">
              <div className="panel-title"><Cpu size={18} /> 02. Risk Scoring Engine</div>
            </div>
            <div style={{ padding: '0.5rem' }}>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  The engine processes five primary telemetry streams to calculate a Weighted Asset Safety Index (0-100).
               </p>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                     <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ padding: '0.75rem' }}>Risk Vector</th>
                        <th style={{ padding: '0.75rem' }}>Threshold</th>
                        <th style={{ padding: '0.75rem' }}>Weight</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem', color: '#fff' }}>Unsafe Approval</td>
                        <td style={{ padding: '0.75rem' }}>&gt; 80% Supply</td>
                        <td style={{ padding: '0.75rem', color: 'var(--danger)', fontWeight: 700 }}>Crit (40)</td>
                     </tr>
                     <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem', color: '#fff' }}>Protocol Blacklist</td>
                        <td style={{ padding: '0.75rem' }}>Direct Match</td>
                        <td style={{ padding: '0.75rem', color: 'var(--danger)', fontWeight: 700 }}>High (30)</td>
                     </tr>
                     <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem', color: '#fff' }}>Bad Reputation</td>
                        <td style={{ padding: '0.75rem' }}>Score &lt; 30</td>
                        <td style={{ padding: '0.75rem', color: 'var(--warning)', fontWeight: 700 }}>Med (20)</td>
                     </tr>
                     <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem', color: '#fff' }}>Tx Velocity</td>
                        <td style={{ padding: '0.75rem' }}>&gt; 10 / min</td>
                        <td style={{ padding: '0.75rem', color: 'var(--warning)', fontWeight: 700 }}>Low (10)</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         {/* Chainlink Integration */}
         <div className="panel">
            <div className="panel-header">
               <div className="panel-title"><LinkIcon size={18} color="#375bd2" /> 03. Chainlink Oracles</div>
            </div>
            <div style={{ padding: '0.5rem' }}>
               <p style={{ lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  SentinelAI leverages Chainlink for decentralized validation. By ensuring accurate market data, the protocol prevents "False Positives" during market volatility.
               </p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(55, 91, 210, 0.05)', border: '1px solid rgba(55, 91, 210, 0.2)', borderRadius: '8px' }}>
                     <div style={{ color: '#375bd2', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Price Feeds</div>
                     <div style={{ fontSize: '0.85rem', color: '#fff' }}>ETH / USD Aggregator on Sepolia</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>0x694AA1769357...5306</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                     <div style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Deterministic Truth</div>
                     <div style={{ fontSize: '0.85rem', color: '#fff' }}>Prevails over local RPC data to prevent Byzantine faults in risk thresholding.</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Smart Contract Deep Dive */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
           <div className="panel-title"><Code size={18} /> 04. Smart Contract Architecture</div>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>GuardianVault Contract</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              The primary interventional layer. Deployed at <code>0xD78409...59Ef</code>. It implements high-velocity locking and multi-token approval revocation.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="chip active">EVM Compatible</span>
              <span className="chip active">Gas Optimized</span>
              <span className="chip active">OpenZeppelin Protected</span>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', overflowX: 'auto' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>// Core Functionality</div>
            <div style={{ color: '#fff', whiteSpace: 'nowrap' }}>function emergencyLock(address user)</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>  external onlySentinel() {'{'} ... {'}'}</div>
            <div style={{ color: '#fff', whiteSpace: 'nowrap' }}>function revokeHighRiskApproval(address user, addr token)</div>
            <div style={{ color: 'var(--text-muted)' }}>  external onlySentinel() {'{'} ... {'}'}</div>
          </div>
        </div>
      </div>

      {/* Infrastructure Section */}
      <div className="panel">
        <div className="panel-header">
           <div className="panel-title"><Layers size={18} /> 05. Infrastructure Specifications</div>
        </div>
        <div className="status-bar-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-icon-wrap"><Globe size={18} color="var(--primary)" /></div>
              <div>
                <div className="stat-label">Frontend</div>
                <div className="stat-value" style={{ fontSize: '0.85rem' }}>React 19 + Vite</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap"><Database size={18} color="var(--secondary)" /></div>
              <div>
                <div className="stat-label">Backend</div>
                <div className="stat-value" style={{ fontSize: '0.85rem' }}>FastAPI + Python</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap"><Activity size={18} color="var(--warning)" /></div>
              <div>
                <div className="stat-label">Real-time</div>
                <div className="stat-value" style={{ fontSize: '0.85rem' }}>Wagmi + Viem</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap"><Lock size={18} color="var(--danger)" /></div>
              <div>
                <div className="stat-label">Security</div>
                <div className="stat-value" style={{ fontSize: '0.85rem' }}>Solidity 0.8.20</div>
              </div>
            </div>
        </div>
      </div>

      {/* Footer / Contact */}
      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          SentinelAI Protocol — Version 1.2.0 (Stable Release)<br />
          Built on Sepolia Ethereum Testnet
        </p>
      </div>

    </div>
  )
}
