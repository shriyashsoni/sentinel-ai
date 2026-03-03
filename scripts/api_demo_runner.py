import json
import sys
from pathlib import Path

from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app


def main() -> None:
    client = TestClient(app)

    high_risk_payload = {
        "signals": {
            "wallet": "0x1111111111111111111111111111111111111111",
            "approvalAmountPercent": 95,
            "contractReputationScore": 18,
            "transactionVelocity": 12,
            "velocityThreshold": 10,
            "newContractInteraction": True,
            "blacklistMatch": True,
        },
        "threshold": 70,
    }

    health = client.get("/health")
    evaluate = client.post("/risk/evaluate", json=high_risk_payload)
    execute = client.post("/risk/execute", json={"decision": evaluate.json()})
    runs = client.get("/runs?limit=10")

    report = {
        "health": {
            "status_code": health.status_code,
            "body": health.json(),
        },
        "evaluate": {
            "status_code": evaluate.status_code,
            "body": evaluate.json(),
        },
        "execute": {
            "status_code": execute.status_code,
            "body": execute.json(),
        },
        "runs": {
            "status_code": runs.status_code,
            "count": len(runs.json()),
            "body": runs.json(),
        },
    }

    output_path = Path("simulation-data/demo_api_result.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(json.dumps(report, indent=2))
    print(f"\nSaved: {output_path}")


if __name__ == "__main__":
    main()
