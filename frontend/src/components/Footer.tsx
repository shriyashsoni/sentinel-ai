import { Link } from 'react-router-dom'
import { Github, Twitter, ExternalLink, Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <div className="brand" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
              <Shield size={24} /> SentinelAI
            </div>
            <p>
              Autonomous Web3 risk guardian powered by deterministic rules and verifiable onchain protection.
              Securing the future of DeFi with real-time AI agents.
            </p>
            <div className="social-icons" style={{ marginTop: '1.5rem' }}>
              <a href="#" className="btn btn-outline btn-icon"><Github size={18} /></a>
              <a href="https://x.com/shriyash_soni" target="_blank" rel="noreferrer" className="btn btn-outline btn-icon"><Twitter size={18} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/whitepaper">Whitepaper</Link>
              <Link to="/about">About Sentinel</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Onchain Proofs</h4>
            <div className="footer-links">
              <a href="https://sepolia.etherscan.io/" target="_blank" rel="noreferrer">
                Guardian Contract <ExternalLink size={12} />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                Latest Audit
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                Status Page
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SentinelAI Protocol. All rights reserved.</span>
          <span>Built for Chainlink CRE Constellation</span>
        </div>
      </div>
    </footer>
  )
}
