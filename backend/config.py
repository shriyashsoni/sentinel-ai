import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SIM_DATA_DIR = BASE_DIR / "simulation-data"
SIM_DATA_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_THRESHOLD = 70
DEFAULT_INPUT_FILE = SIM_DATA_DIR / "sample_wallet.json"
DEFAULT_DECISION_FILE = SIM_DATA_DIR / "risk_decision.json"
DEFAULT_ONCHAIN_FILE = SIM_DATA_DIR / "onchain_result.json"
RUN_HISTORY_FILE = SIM_DATA_DIR / "backend_runs.jsonl"

CORS_ALLOW_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ALLOW_ORIGINS", "*").split(",") if origin.strip()]
