import { Info, Code, ShieldCheck, Database, Layers } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="container page dashboard-layout" style={{ maxWidth: '800px', margin: '0 auto', display: 'block' }}>
      
      <div className="panel" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem 1rem' }}>
        <ShieldCheck size={48} color="#4264fb" style={{ marginBottom: '1rem' }} />
        <h1>About SentinelAI</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a0aec0', fontSize: '1.1rem' }}>
          Built for the Chainlink Constellation Hackathon (CRE Track).
          An autonomous guardian that bridges off-chain risk analysis with on-chain execution.
        </p>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
             <div className="panel-title"><Info size={18} /> Mission Statement</div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
             <li style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <strong style={{ color: '#fff' }}>Proactive Defense</strong>
               <div style={{ color: '#888', fontSize: '0.9rem' }}>Moving from reactive alerts to pre-emptive protection.</div>
             </li>
             <li style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <strong style={{ color: '#fff' }}>Transparency</strong>
               <div style={{ color: '#888', fontSize: '0.9rem' }}>Making security logic auditable and deterministic.</div>
             </li>
             <li style={{ padding: '0.8rem 0' }}>
               <strong style={{ color: '#fff' }}>On-chain Reality</strong>
               <div style={{ color: '#888', fontSize: '0.9rem' }}>Ensuring that risk assessments result in verifiable on-chain state changes.</div>
             </li>
          </ul>
        </div>

        <div className="panel">
           <div className="panel-header">
              <div className="panel-title"><Layers size={18} /> Technology Stack</div>
           </div>
           
           <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                 <Code size={20} color="#61dafb" />
                 <div>
                    <strong>Frontend</strong>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>React + Vite + Wagmi + Viem</div>
                 </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                 <Database size={20} color="#009688" />
                 <div>
                    <strong>Backend Intelligence</strong>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>FastAPI Risk Orchestration Engine</div>
                 </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                 <ShieldCheck size={20} color="#627eea" />
                 <div>
                    <strong>Blockchain Layer</strong>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Ethereum Sepolia + GuardianVault Smart Contracts</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

    </div>
  )
}
