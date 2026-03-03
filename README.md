# SentinelAI — Autonomous Web3 Risk Guardian

SentinelAI is a deterministic + autonomous safety layer for Web3 wallets.
It evaluates wallet activity signals, computes a reproducible risk score, and triggers protective onchain actions through a CRE workflow.

## Project Structure

```text
sentinel-ai/
├── contracts/
│   └── GuardianVault.sol
├── workflows/
│   └── guardian-workflow.yaml
├── scripts/
│   ├── risk_engine.py
│   └── onchain_action.py
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── repository.py
│   ├── schemas.py
│   └── services.py
├── simulation-data/
│   ├── sample_wallet.json
│   ├── risk_decision.json         # generated
│   └── onchain_result.json        # generated
├── .env.example
├── requirements.txt
└── submission.md
```

## Deterministic Risk Model

Risk score rules:

- +40 if `approvalAmountPercent > 80`
- +30 if `blacklistMatch == true`
- +20 if `contractReputationScore < 30`
- +10 if `transactionVelocity > velocityThreshold`
- +5 if `newContractInteraction == true`

Protection threshold: `riskScore >= 70`

## Contract

`GuardianVault.sol` exposes:

- `flagContract(address)`
- `reportRisk(address,uint256)`
- `activateProtection(address)`
- `revokeHighRiskApproval(address,address)`
- `emergencyLock(address)`

It stores:

- `protectionActive`
- `flaggedContracts`
- `riskScores`

## Setup

1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy environment file and fill values:

```bash
cp .env.example .env
```

4. Deploy `GuardianVault.sol` on your CRE-supported testnet and set:

- `RPC_URL`
- `PRIVATE_KEY`
- `GUARDIAN_CONTRACT`
- `CHAIN_ID`

## Run Locally (without CRE)

```bash
python scripts/risk_engine.py --input simulation-data/sample_wallet.json --output simulation-data/risk_decision.json --threshold 70
python scripts/onchain_action.py
```

## Backend API

Start API server:

```bash
uvicorn backend.app:app --reload --port 8000
```

Endpoints:

- `GET /health`
- `POST /risk/evaluate`
- `POST /risk/execute`
- `POST /risk/pipeline`
- `GET /runs?limit=20`

Example evaluate request:

```json
{
	"signals": {
		"wallet": "0x1111111111111111111111111111111111111111",
		"approvalAmountPercent": 95,
		"contractReputationScore": 18,
		"transactionVelocity": 12,
		"velocityThreshold": 10,
		"newContractInteraction": true,
		"blacklistMatch": true
	},
	"threshold": 70
}
```

One-command backend demo artifact generation:

```bash
powershell -ExecutionPolicy Bypass -File scripts/run_demo.ps1
```

This creates:

- `simulation-data/demo_api_result.json`

## Run with CRE Simulation (CRE CLI v1.2+)

```bash
cre workflow simulate <workflow-folder>
```

Example used in this workspace:

```bash
cd sentinel-ai/sentinel-ai
cre workflow simulate sentinel-guardian-go --non-interactive --trigger-index 0
```

Expected outputs:

- `simulation-data/risk_decision.json`
- `simulation-data/onchain_result.json`
- `simulation-data/cre_simulation.log`
- transaction hash(es) in output when threshold is crossed

## Submission Proof Checklist

- Include deployed contract address and network
- Include TX hash for `reportRisk` and/or `activateProtection`
- Include explorer links
- Attach simulation logs from `cre simulate`
- Add final write-up from `submission.md`

## Notes

- Decisioning is deterministic and reproducible.
- The AI explanation layer is optional and can be added after MVP.
