# SentinelAI — Autonomous Web3 Risk Guardian

**Track:** Chainlink CRE Agents  
**Hashtag:** #cre-ai

## 1) Problem
Retail users in Web3 are exposed to malicious approvals, scam contracts, and blind signing. Security is mostly reactive; once a wallet is drained, recovery is unlikely.

## 2) Solution
SentinelAI is an autonomous safety layer that:

1. Monitors wallet risk signals
2. Computes a deterministic risk score
3. Evaluates explicit security rules
4. Executes onchain protective actions via CRE workflow
5. Produces reproducible simulation outputs

## 3) Why it matters
SentinelAI lowers the safety barrier for DeFi adoption by providing proactive, automated wallet defense.

## 4) Architecture
Wallet Signals → Risk Aggregator → Deterministic Risk Engine → Rule Layer → CRE Workflow → GuardianVault Contract → Onchain Protection + Event Logs

## 5) Deterministic rule model
- +40 if approval > 80%
- +30 if blacklist match is true
- +20 if contract reputation < 30
- +10 if tx velocity > threshold
- +5 if new contract interaction is true

Trigger condition: `riskScore >= 70`

## 6) Onchain action proof
- Network: `Ethereum Sepolia`
- Contract: `0xD7840983B638cFcf9fC0CD32b358B02eb43E59Ef`
- Contract explorer: `https://sepolia.etherscan.io/address/0xD7840983B638cFcf9fC0CD32b358B02eb43E59Ef`
- Deploy tx hash: `0xfb31ca91659f2d5b2b0b6d2494404f7811d6e4334ccbb0d7cac561b40893f223`
- `reportRisk` tx hash: `0xb12e433be2da203c5aeed04f5fb06b5a2e5af25cbfd6e7e0ff2ae4dd65fff5a5`
- `activateProtection` tx hash: `0x982deec91d1c8f57f97f800bb54c7c23e13ab79b4cabd4dd136ddd571291b1ae`
- Explorer links:
	- `https://sepolia.etherscan.io/tx/0xb12e433be2da203c5aeed04f5fb06b5a2e5af25cbfd6e7e0ff2ae4dd65fff5a5`
	- `https://sepolia.etherscan.io/tx/0x982deec91d1c8f57f97f800bb54c7c23e13ab79b4cabd4dd136ddd571291b1ae`

## 7) Reproducibility
Repository contains:
- Smart contract (`contracts/GuardianVault.sol`)
- Workflow (`workflows/guardian-workflow.yaml`)
- Risk engine (`scripts/risk_engine.py`)
- Deterministic sample input (`simulation-data/sample_wallet.json`)

Run:

```bash
cre workflow simulate <workflow-folder>
```

Example used:

```bash
cd sentinel-ai/sentinel-ai
cre workflow simulate sentinel-guardian-go --non-interactive --trigger-index 0
```

## 8) Simulation output artifacts
- `simulation-data/risk_decision.json`
- `simulation-data/onchain_result.json`
- `simulation-data/local_simulation.log`
- `simulation-data/cre_simulation.log`
- `simulation-data/demo_api_result.json`
- `simulation-data/proof_bundle.md`

## 9) Current scope
MVP demonstrates deterministic autonomous protection with onchain writes. Future iterations can add dynamic thresholds, multi-wallet monitoring, and richer explainability.
