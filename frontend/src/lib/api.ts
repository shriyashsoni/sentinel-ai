import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
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
