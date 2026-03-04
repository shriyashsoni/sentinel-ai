// Original GuardianVault contract (currently deployed)
export const guardianContract = {
  address: '0xD7840983B638cFcf9fC0CD32b358B02eb43E59Ef' as const,
  chainId: 11155111,
  abi: [
    {
      inputs: [],
      name: 'protectionActive',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'riskScores',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'contractAddress', type: 'address' }],
      name: 'flagContract',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'user', type: 'address' },
        { internalType: 'uint256', name: 'score', type: 'uint256' },
      ],
      name: 'reportRisk',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'activateProtection',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'user', type: 'address' },
        { internalType: 'address', name: 'token', type: 'address' },
      ],
      name: 'revokeHighRiskApproval',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'emergencyLock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'user', type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'score', type: 'uint256' },
      ],
      name: 'RiskDetected',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [{ indexed: true, internalType: 'address', name: 'user', type: 'address' }],
      name: 'ProtectionActivated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [{ indexed: true, internalType: 'address', name: 'contractAddress', type: 'address' }],
      name: 'ContractFlagged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [{ indexed: true, internalType: 'address', name: 'user', type: 'address' }],
      name: 'EmergencyLock',
      type: 'event',
    },
  ] as const,
}

// Chainlink ETH/USD Price Feed on Sepolia
export const chainlinkPriceFeed = {
  address: '0x694AA1769357215DE4FAC081bf1f309aDC325306' as const,
  chainId: 11155111,
  abi: [
    {
      inputs: [],
      name: 'latestRoundData',
      outputs: [
        { internalType: 'uint80', name: 'roundId', type: 'uint80' },
        { internalType: 'int256', name: 'answer', type: 'int256' },
        { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
        { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
        { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'description',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const,
}

// New SentinelGuardian with Chainlink integration (deploy this contract)
// After deploying, update the address below
export const sentinelGuardianContract = {
  // Update this address after deploying SentinelGuardian.sol
  address: '0x0000000000000000000000000000000000000000' as const,
  chainId: 11155111,
  abi: [
    // View Functions
    {
      inputs: [],
      name: 'protectionActive',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'automationThreshold',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'riskScores',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'protectedUsers',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getLatestPrice',
      outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'isPriceAlertActive',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getMonitoredWallets',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'getUserStatus',
      outputs: [
        { internalType: 'uint256', name: 'riskScore', type: 'uint256' },
        { internalType: 'bool', name: 'isProtected', type: 'bool' },
        { internalType: 'uint256', name: 'lastCheck', type: 'uint256' },
        { internalType: 'int256', name: 'currentEthPrice', type: 'int256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getSystemStatus',
      outputs: [
        { internalType: 'bool', name: 'globalProtection', type: 'bool' },
        { internalType: 'uint256', name: 'threshold', type: 'uint256' },
        { internalType: 'uint256', name: 'monitoredCount', type: 'uint256' },
        { internalType: 'int256', name: 'ethPrice', type: 'int256' },
        { internalType: 'bool', name: 'priceAlert', type: 'bool' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    // Write Functions
    {
      inputs: [{ internalType: 'address', name: 'contractAddress', type: 'address' }],
      name: 'flagContract',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'user', type: 'address' },
        { internalType: 'uint256', name: 'score', type: 'uint256' },
      ],
      name: 'reportRisk',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'activateProtection',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'user', type: 'address' },
        { internalType: 'address', name: 'token', type: 'address' },
      ],
      name: 'revokeHighRiskApproval',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'emergencyLock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'wallet', type: 'address' }],
      name: 'addMonitoredWallet',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_threshold', type: 'uint256' }],
      name: 'setAutomationThreshold',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'resetProtection',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    // Events
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'user', type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'score', type: 'uint256' },
        { indexed: false, internalType: 'int256', name: 'ethPrice', type: 'int256' },
      ],
      name: 'RiskDetected',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'user', type: 'address' },
        { indexed: false, internalType: 'string', name: 'reason', type: 'string' },
      ],
      name: 'ProtectionActivated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'user', type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'score', type: 'uint256' },
      ],
      name: 'AutomationTriggered',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, internalType: 'int256', name: 'currentPrice', type: 'int256' },
        { indexed: false, internalType: 'int256', name: 'threshold', type: 'int256' },
      ],
      name: 'PriceAlertTriggered',
      type: 'event',
    },
  ] as const,
}

