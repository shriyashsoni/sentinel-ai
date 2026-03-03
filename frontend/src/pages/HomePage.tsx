import { motion } from 'framer-motion'
import { ThreeHero } from '../components/ThreeHero'
import { Link } from 'react-router-dom'
import { ShieldCheck, Zap, Link as LinkIcon, ScanEye } from 'lucide-react'

export function HomePage() {
  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="badge">AI-POWERED SECURITY v2.0</div>
            <h1 className="hero-title">
              Autonomous <span className="gradient-text">Web3 Risk Guardian</span>
            </h1>
            <p className="hero-subtitle">
              SentinelAI utilizes deterministic risk execution engines to protect your assets on-chain.
              Real-time monitoring, automated threat neutralizing, and verifiable proofs.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">Launch App</Link>
              <Link to="/whitepaper" className="btn btn-outline">Read Docs</Link>
            </div>
          </motion.div>
        </div>
        
        <div className="hero-visual">
          <ThreeHero />
        </div>
      </section>

      {/* Stats Section */}
      <div className="stats-bar">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-value">$42.5M+</span>
            <span className="stat-label">Value Secured</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">12.8k</span>
            <span className="stat-label">Threats Blocked</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0.04s</span>
            <span className="stat-label">Reaction Time</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <section className="features-section container">
        <h2 className="section-title">Sentinel Architecture</h2>
        <div className="features-grid">
          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon"><ShieldCheck size={40} color="#4264fb" /></div>
            <h3>Deterministic Engine</h3>
            <p>Risk scoring algorithms operating with mathematical certainty on every transaction.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon"><Zap size={40} color="#ffb742" /></div>
            <h3>Flash Execution</h3>
            <p>Automated counter-measures executed in the same block as the detected threat.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon"><LinkIcon size={40} color="#8ca6ff" /></div>
            <h3>Onchain Proofs</h3>
            <p>Every decision is recorded on Sepolia with cryptographic evidence of the logic used.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon"><ScanEye size={40} color="#fa5252" /></div>
            <h3>24/7 Surveillance</h3>
            <p>The Sentinel AI never sleeps, monitoring mempools and state changes continuously.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to secure your protocol?</h2>
          <p>Integrate Sentinel AI in less than 5 minutes.</p>
          <Link to="/dashboard" className="btn btn-primary btn-lg">Get Started Now</Link>
        </div>
      </section>
    </div>
  )
}
