# SentinelAI Proof Bundle

## 1) Deployed Smart Contract (Sepolia)

- Contract: `0xD7840983B638cFcf9fC0CD32b358B02eb43E59Ef`
- Deploy Tx: `0xfb31ca91659f2d5b2b0b6d2494404f7811d6e4334ccbb0d7cac561b40893f223`
- Explorer (Contract): https://sepolia.etherscan.io/address/0xD7840983B638cFcf9fC0CD32b358B02eb43E59Ef
- Explorer (Deploy Tx): https://sepolia.etherscan.io/tx/0xfb31ca91659f2d5b2b0b6d2494404f7811d6e4334ccbb0d7cac561b40893f223

## 2) Onchain Protection Action Proof

Latest successful writes:

- `reportRisk` tx: `0x7eb8a3ef33a221aa19789411ef3f6409b99269df8e6c48c442bff3d7a3970c76`
- `activateProtection` tx: `0xd0048553947597b28b91b00594b27b57facb7d40bf96b1cba3f619853b79cbc7`

Explorer links:

- https://sepolia.etherscan.io/tx/0x7eb8a3ef33a221aa19789411ef3f6409b99269df8e6c48c442bff3d7a3970c76
- https://sepolia.etherscan.io/tx/0xd0048553947597b28b91b00594b27b57facb7d40bf96b1cba3f619853b79cbc7

## 3) Deterministic Risk + Execution Artifacts

- Decision output: `simulation-data/risk_decision.json`
- Onchain execution output: `simulation-data/onchain_result.json`
- Local simulation log: `simulation-data/local_simulation.log`

## 4) CRE CLI Simulation (Official)

CRE CLI installed and authenticated (`cre version v1.2.0`).

Simulation command used:

```bash
cd sentinel-ai/sentinel-ai
cre workflow simulate sentinel-guardian-go --non-interactive --trigger-index 0
```

Simulation log file:

- `simulation-data/cre_simulation.log`

## 5) Important Note

CRE CLI v1.2 uses `cre workflow simulate <workflow-folder>` and expects a CRE project/workflow folder structure. The original `workflows/guardian-workflow.yaml` in this repo remains as the SentinelAI custom orchestration template, while official CRE simulation proof was produced from the initialized CRE workflow folder.
