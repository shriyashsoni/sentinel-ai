import { Network, BrainCircuit, Cpu, Zap, AlertOctagon } from 'lucide-react'

export function WhitepaperPage() {
  return (
    <div className="container page dashboard-layout" style={{ display: 'block', maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
           <div className="panel-title"><Network size={18} /> System Architecture: SentinelAI</div>
        </div>
        <div style={{ padding: '0 0.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            <BrainCircuit size={20} color="#4264fb" /> Abstract
          </h2>
          <p style={{ lineHeight: '1.6', color: '#a0aec0' }}>
            SentinelAI is an autonomous on-chain safety layer that acts as a <strong>proactive defense system</strong> for digital assets. 
            By monitoring real-time wallet heuristics and computing deterministic risk scores, it executes defensive smart contract actions 
            milliseconds before a threshold breach can result in loss.
          </p>

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginTop: '2rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            <AlertOctagon size={20} color="#ff4242" /> The Problem Space
          </h2>
          <p style={{ lineHeight: '1.6', color: '#a0aec0' }}>
            Retail users are increasingly vulnerable to malicious approvals, high-velocity draining attacks, and deceptive contract interactions.
            Traditional security models are <em>reactive</em>—alerting users only after a transaction is signed or funds are lost. SentinelAI shifts the paradigm to 
            <em>pre-execution deterministic protection</em>.
          </p>
        </div>
      </div>

      <div className="grid-2">
         <div className="panel">
            <div className="panel-header">
              <div className="panel-title"><Cpu size={18} /> Risk Scoring Logic</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
               <thead>
                  <tr style={{ color: '#888', textAlign: 'left', borderBottom: '1px solid #333' }}>
                     <th style={{ padding: '0.5rem' }}>Condition</th>
                     <th style={{ padding: '0.5rem' }}>Impact</th>
                  </tr>
               </thead>
               <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <td style={{ padding: '0.8rem' }}>Approval Amount &gt; 80%</td>
                     <td style={{ padding: '0.8rem', color: '#ff4242' }}>+40 Points</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <td style={{ padding: '0.8rem' }}>Blacklist Match</td>
                     <td style={{ padding: '0.8rem', color: '#ff4242' }}>+30 Points</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <td style={{ padding: '0.8rem' }}>Contract Reputation &lt; 30</td>
                     <td style={{ padding: '0.8rem', color: '#ffb742' }}>+20 Points</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <td style={{ padding: '0.8rem' }}>Velocity &gt; Threshold</td>
                     <td style={{ padding: '0.8rem', color: '#ffb742' }}>+10 Points</td>
                  </tr>
                  <tr>
                     <td style={{ padding: '0.8rem' }}>New Interaction</td>
                     <td style={{ padding: '0.8rem', color: '#8ca6ff' }}>+5 Points</td>
                  </tr>
               </tbody>
            </table>
         </div>

         <div className="panel">
            <div className="panel-header">
               <div className="panel-title"><Zap size={18} /> Execution Layer</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
               <li style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <strong style={{ color: '#fff', display:'block', marginBottom:'0.2rem' }}>1. Signal Intake</strong>
                  <span style={{ color: '#888', fontSize:'0.9rem' }}>Ingests wallet activity via RPC and API endpoints.</span>
               </li>
               <li style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <strong style={{ color: '#fff', display:'block', marginBottom:'0.2rem' }}>2. Deterministic Scoring</strong>
                  <span style={{ color: '#888', fontSize:'0.9rem' }}>Applies immutable ruleset to calculate current risk state.</span>
               </li>
               <li style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <strong style={{ color: '#fff', display:'block', marginBottom:'0.2rem' }}>3. Decision Engine</strong>
                  <span style={{ color: '#888', fontSize:'0.9rem' }}>Evaluates Score vs. User Threshold to determine action.</span>
               </li>
               <li style={{ padding: '1rem' }}>
                  <strong style={{ color: '#fff', display:'block', marginBottom:'0.2rem' }}>4. On-chain Settlement</strong>
                  <span style={{ color: '#888', fontSize:'0.9rem' }}>Sepolia GuardianVault stores proof and activates lock.</span>
               </li>
            </ul>
         </div>
      </div>
    </div>
  )
}
