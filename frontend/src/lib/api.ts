import axios from 'axios'

// Determine API URL based on environment
const getApiUrl = () => {
  // In production (Vercel), use /api
  if (import.meta.env.PROD) {
    return '/api'
  }
  // In development, use env variable or localhost
  return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
}

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export type WalletSignals = {
  wallet: string
  approvalAmountPercent: number
  contractReputationScore: number
  transactionVelocity: number
  velocityThreshold: number
  newContractInteraction: boolean
  blacklistMatch: boolean
}

export async function runPipeline(signals: WalletSignals, threshold = 70) {
  const response = await api.post('/risk/pipeline', { signals, threshold })
  return response.data
}

export async function evaluateRisk(signals: WalletSignals, threshold = 70) {
  const response = await api.post('/risk/evaluate', { signals, threshold })
  return response.data
}

export async function executeRisk(decision: Record<string, unknown>) {
  const response = await api.post('/risk/execute', { decision })
  return response.data
}

export async function getRuns(limit = 20) {
  const response = await api.get(`/runs?limit=${limit}`)
  return response.data
}

export async function getHealth() {
  const response = await api.get('/health')
  return response.data
}
