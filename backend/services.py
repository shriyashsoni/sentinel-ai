import json
from pathlib import Path
from typing import Any

from backend import config
from scripts.onchain_action import execute_from_decision
from scripts.risk_engine import build_decision


def evaluate(signals: dict[str, Any], threshold: int) -> dict[str, Any]:
    return build_decision(signals, threshold=threshold)


def execute(decision: dict[str, Any], output_path: Path | None = None) -> dict[str, Any]:
    target_output = output_path or config.DEFAULT_ONCHAIN_FILE
    return execute_from_decision(decision, output_path=target_output)


def evaluate_and_execute(signals: dict[str, Any], threshold: int) -> dict[str, Any]:
    decision = evaluate(signals, threshold=threshold)
    onchain = execute(decision)

    config.DEFAULT_DECISION_FILE.write_text(
        json.dumps(decision, indent=2), encoding="utf-8"
    )

    return {"decision": decision, "onchain": onchain}
