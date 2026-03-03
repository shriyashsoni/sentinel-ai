import argparse
import json
from pathlib import Path

DEFAULT_INPUT = Path("simulation-data/sample_wallet.json")
DEFAULT_OUTPUT = Path("simulation-data/risk_decision.json")


def calculate_risk_score(signals: dict) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    approval_percent = signals.get("approvalAmountPercent", 0)
    if approval_percent > 80:
        score += 40
        reasons.append("approvalAmountPercent > 80 (+40)")

    if bool(signals.get("blacklistMatch", False)):
        score += 30
        reasons.append("blacklistMatch == true (+30)")

    reputation_score = signals.get("contractReputationScore", 100)
    if reputation_score < 30:
        score += 20
        reasons.append("contractReputationScore < 30 (+20)")

    transaction_velocity = signals.get("transactionVelocity", 0)
    velocity_threshold = signals.get("velocityThreshold", 10)
    if transaction_velocity > velocity_threshold:
        score += 10
        reasons.append("transactionVelocity > velocityThreshold (+10)")

    if bool(signals.get("newContractInteraction", False)):
        score += 5
        reasons.append("newContractInteraction == true (+5)")

    return score, reasons


def build_decision(signals: dict, threshold: int = 70) -> dict:
    risk_score, reasons = calculate_risk_score(signals)
    action = "activateProtection" if risk_score >= threshold else "monitor"

    return {
        "wallet": signals.get("wallet"),
        "action": action,
        "riskScore": risk_score,
        "threshold": threshold,
        "triggered": risk_score >= threshold,
        "reason": ", ".join(reasons) if reasons else "No high-risk indicators",
        "signals": signals,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="SentinelAI deterministic risk engine")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Path to wallet signal JSON")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Path for decision JSON")
    parser.add_argument("--threshold", type=int, default=70, help="Risk threshold")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    with input_path.open("r", encoding="utf-8") as f:
        signals = json.load(f)

    decision = build_decision(signals, threshold=args.threshold)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(decision, f, indent=2)

    print(json.dumps(decision, indent=2))


if __name__ == "__main__":
    main()
