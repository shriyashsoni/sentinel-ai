import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class JsonlRunRepository:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path
        self.file_path.parent.mkdir(parents=True, exist_ok=True)

    def append(self, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": event_type,
            "payload": payload,
        }
        with self.file_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
        return record

    def list_recent(self, limit: int = 20) -> list[dict[str, Any]]:
        if not self.file_path.exists():
            return []

        with self.file_path.open("r", encoding="utf-8") as f:
            lines = f.readlines()

        selected = lines[-limit:]
        return [json.loads(line) for line in selected if line.strip()]
