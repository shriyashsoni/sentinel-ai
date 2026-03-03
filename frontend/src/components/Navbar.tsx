import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAccount, useChainId, useChains, useConnect, useDisconnect, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { ShieldCheck, Network, Wallet, LogOut, Coins } from 'lucide-react'
import { useEffect } from 'react'

export function Navbar() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const chains = useChains()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isConnected && location.pathname === '/') {
      navigate('/dashboard')
    }
  }, [isConnected, location.pathname, navigate])

  const currentChain = chains.find(c => c.id === chainId)
  const isTestnet = currentChain?.testnet
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  const formattedBalance = balance ? Number(formatEther(balance.value)).toFixed(3) : '0.000'

  return (
    <header className="nav-wrap">
      <div className="container nav">
        {/* Brand Logo - Uses CSS utility classes for gradient text */}
        <Link to="/" className="brand">
          <ShieldCheck size={28} color="#4264fb" strokeWidth={2.5} />
          <span style={{ 
            background: 'linear-gradient(90deg, #fff, #a0aec0)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginLeft: '0.5rem',
            fontWeight: 'bold',
            letterSpacing: '0.05em'
          }}>
            SENTINEL<span style={{ color: '#4264fb', WebkitTextFillColor: '#4264fb' }}>AI</span>
          </span>
        </Link>
        
        {/* Navigation Links - Centered Pill */}
        <nav className="links">
          <NavLink to="/whitepaper" className={({ isActive }) => isActive ? 'active' : ''}>
             Whitepaper
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
             About
          </NavLink>
        </nav>

        {/* Wallet Actions */}
        <div className="wallet-box">
           {isConnected ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               {/* Network Indicator */}
               <div className="chip" style={{ 
                 borderColor: isTestnet ? 'rgba(255, 183, 66, 0.3)' : 'rgba(0, 255, 157, 0.2)',
                 color: isTestnet ? '#ffb742' : '#00ff9d',
                 display: 'flex',
                 gap: '0.5rem'
               }}>
                 <Network size={14} />
                 <span>{currentChain?.name || 'Unknown Network'}</span>
                 {isTestnet && <span style={{ fontSize: '0.65rem', background: 'rgba(255, 183, 66, 0.1)', padding: '0 4px', borderRadius: '4px' }}>TEST</span>}
               </div>

                {/* Balance Display */}
               <div className="chip" style={{ background: 'rgba(66, 100, 251, 0.1)', borderColor: 'rgba(66, 100, 251, 0.2)', color: '#8ca6ff', gap: '0.5rem' }}>
                 <Coins size={14} />
                 <span>{formattedBalance} ETH</span>
               </div>

               {/* Address Display */}
               <div className="chip active">
                 <Wallet size={14} />
                 {shortAddress}
               </div>

               {/* Disconnect Button */}
               <button 
                  onClick={() => disconnect()} 
                  className="btn btn-outline btn-icon" 
                  title="Disconnect Wallet"
                  style={{ padding: '0.5rem', marginLeft: '0.2rem' }}
               >
                 <LogOut size={16} />
               </button>
             </div>
           ) : (
             <button
               onClick={() => connect({ connector: connectors[0] })}
               className="btn btn-primary"
               disabled={isPending || connectors.length === 0}
             >
               {isPending ? 'Connecting...' : 'Connect Wallet'}
             </button>
           )}
        </div>
      </div>
    </header>
  )
}
