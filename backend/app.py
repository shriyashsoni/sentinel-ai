import json

from fastapi import FastAPI, HTTPException, Query

from backend import config
from backend.repository import JsonlRunRepository
from backend.schemas import ExecuteRequest, PipelineRequest, PipelineResponse, RiskDecision, RiskEvaluationRequest
from backend.services import evaluate, evaluate_and_execute, execute

app = FastAPI(title="SentinelAI Backend", version="0.1.0")
repo = JsonlRunRepository(config.RUN_HISTORY_FILE)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "sentinel-ai-backend"}


@app.post("/risk/evaluate", response_model=RiskDecision)
def evaluate_risk(request: RiskEvaluationRequest) -> RiskDecision:
    decision = evaluate(request.signals.model_dump(), threshold=request.threshold)
    repo.append("risk_evaluated", decision)
    config.DEFAULT_DECISION_FILE.write_text(json.dumps(decision, indent=2), encoding="utf-8")
    return RiskDecision(**decision)


@app.post("/risk/execute")
def execute_risk_action(request: ExecuteRequest) -> dict:
    try:
        result = execute(request.decision.model_dump())
        repo.append("onchain_executed", result)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/risk/pipeline", response_model=PipelineResponse)
def run_pipeline(request: PipelineRequest) -> PipelineResponse:
    try:
        result = evaluate_and_execute(request.signals.model_dump(), threshold=request.threshold)
        repo.append("pipeline_run", result)
        return PipelineResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/runs")
def get_recent_runs(limit: int = Query(20, ge=1, le=200)) -> list[dict]:
    return repo.list_recent(limit=limit)
